Write-Host "Enter Username & password to connect to Azure:"
$USERNAME = Read-Host
[System.Security.SecureString]$secureStringPassword = Read-Host -AsSecureString; 
[String]$PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureStringPassword));
$credentials = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $USERNAME, $secureStringPassword
az login -u $USERNAME -p $PASSWORD

Write-Host "Enter Resource Group name to create:"
$RESOURCEGROUP = Read-Host

Write-Host "Enter Cluster name:"
$CLUSTERNAME = Read-Host

Write-Host "Enter Namespace:"
$NAMESPACE = Read-Host

# Name to associate with public IP address
Write-Host "Enter domain name to use:"
$DNSNAME = Read-Host

<# 

$RESOURCEGROUP = "resgrouppii"
$CLUSTERNAME = "clusterpii"
$NAMESPACE = "namespacepii"
$DNSNAME = "tituspii"
az group create --name $RESOURCEGROUP --location eastus
Write-Host "Resource Group created"

Write-Host "Cluster creation in progress... this may take few minutes..."
az aks create --resource-group $RESOURCEGROUP --name $CLUSTERNAME --node-count 2 --enable-addons monitoring --l eastus -s Standard_D4s_v3
Write-Host "Cluster created"  #>  
<# 
-------------------add a check to look at the status of cluster creation before moving further-------------
#>
 
az aks create --resource-group $RESOURCEGROUP --name $CLUSTERNAME --node-count 2 --enable-addons monitoring --l eastus -s Standard_D4s_v3 
az aks get-credentials --resource-group $RESOURCEGROUP --name $CLUSTERNAME 
Write-Host "Fetched credentials" 

kubectl create namespace $NAMESPACE

kubectl apply -f configMap.yaml -n $NAMESPACE
kubectl apply -f persistentVol.yaml -n $NAMESPACE
kubectl apply -f postgres-service.yaml -n $NAMESPACE
kubectl apply -f postgres-deployment.yaml -n $NAMESPACE
Write-Host "Postgres deployed"

Write-Host "Connecting to azure RM account to gain access to azure key vault:"
Connect-AzureRmAccount -Credential $credentials

Write-Host "Enter VaultName"
$VAULT = Read-Host
$DockerUserName = (((Get-AzureKeyVaultSecret -VaultName $VAULT -Name DockerUserName).SecretValueText) -replace '\n' ,'')
$DockerPassword = (((Get-AzureKeyVaultSecret -VaultName $VAULT -Name DockerPassword).SecretValueText) -replace '\n' ,'')

kubectl create secret docker-registry regcred --docker-server=registry.rare-technologies.com:5050 --docker-username=$DockerUserName --docker-password=$DockerPassword -n $NAMESPACE
Write-Host "Created docker-registry"

Write-Host "Enter Username & password to connect to PII Tools:"
$PIITOOLS_USERNAME = Read-Host
[System.Security.SecureString]$secureStringValue = Read-Host -AsSecureString; 
[String]$PIITOOLS_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureStringValue));
kubectl apply -f pii-tools-service.yaml -n $NAMESPACE
((Get-Content -path pii-tools-deployment.yaml -Raw) -replace 'USER_DEFINED_USERNAME', $PIITOOLS_USERNAME -replace 'USER_DEFINED_PASSWORD', $PIITOOLS_PASSWORD  -replace 'LICENSE_KEY_VALUE', $((Get-AzureKeyVaultSecret -VaultName $VAULT -Name LicenseKey).SecretValueText)) | Set-Content -Path pii-tools-deployment-$NAMESPACE.yaml



kubectl apply -f pii-tools-deployment-$NAMESPACE.yaml -n $NAMESPACE

kubectl rollout status deployment/pii-tools -n $NAMESPACE -v9
$STATUS = $?
Write-Host $STATUS
#check the rollout status and rollback if not successful- kubectl rollout status returns a non-zero exit code if the Deployment has exceeded the progression deadline.


Read-Host


if(!$STATUS){
Write-Host "Error deploying PII Tools... rolling back cluster creation... this may take few minutes"
az group delete -n $RESOURCEGROUP  --yes # you can use --no-wait option if you do not want to wait for the long-running operation to finish
}
else{
Write-Host "PII Tools service deployed"
 
kubectl apply -f ns-and-sa.yaml -n $NAMESPACE
Write-Host "Created service-account"

kubectl apply -f loadbalancer.yaml -n $NAMESPACE

Set-Variable -Name "IP" -Value $(kubectl get svc nginx-ingress --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}" -n $NAMESPACE)

$CheckUser = 0
while($IP -eq $null){
if($CheckUser -le '20'){
  $CheckUser++
  start-sleep -s 10
  $IP = kubectl get svc nginx-ingress --template="{{range.status.loadBalancer.ingress}}{{.ip}}{{end}}" -n $NAMESPACE
  }
}
#add hardening for infinite loop

# Get the resource-id of the public ip
$PUBLICIPID = az network public-ip list --query "[?ipAddress!=null]|[?contains(ipAddress, '$IP')].[id]" --output tsv

# Update public ip address with DNS name
az network public-ip update --ids $PUBLICIPID --dns-name $DNSNAME

((Get-Content -path ./piitools-ingress-cert.yaml -Raw ) -replace 'TLS_CRT', $((Get-AzureKeyVaultSecret -VaultName $VAULT -Name base64crt).SecretValueText -replace '\n' , '')  -replace 'TLS_KEY' , $((Get-AzureKeyVaultSecret -VaultName $VAULT  -Name base64key).SecretValueText).Trim() -replace '\n' , '') |Set-Content -Path secret.yaml
kubectl apply -f secret.yaml -n $NAMESPACE

#Create a config map for customizing NGINX configuration
kubectl apply -f nginx-config.yaml -n $NAMESPACE
Write-Host "Deployed nginx-config"

#If RBAC is enabled in your cluster, create a cluster role and bind it to the service account
((Get-Content -path rbac.yaml -Raw) -replace 'USER_DEFINED_NAMESPACE', $NAMESPACE) | Set-Content -Path rbac-$NAMESPACE.yaml
kubectl apply -f rbac-$NAMESPACE.yaml -n $NAMESPACE
Write-Host "Deployed rbac"

#Deploy the Ingress Controller
kubectl apply -f nginx-ingress.yaml -n $NAMESPACE
Write-Host "Deployed nginx-ingress"

#Deploy the Ingress 
((Get-Content -path ingress.yaml -Raw) -replace 'USER_DEFINED_DOMAIN', $DNSNAME) | Set-Content -Path ingress-$DNSNAME.yaml
kubectl apply -f ingress-$DNSNAME.yaml -n $NAMESPACE
Write-Host "Deployed ingress"
Write-Host "This may take few minutes, wait for sometime before accessing the URL..."
} 
#delete sensitive files

Remove-Item -path secret.yaml
Remove-Item -path pii-tools-deployment-$NAMESPACE.yaml
