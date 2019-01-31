#Write-Host "Enter Username & password to connect to Azure:"
#$USERNAME =-Host
#[System.Security.SecureString]$secureStringPassword = Read-Host -AsSecureString; 
#[String]$PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureStringPassword));
Param($PASSWORD,
$USERNAME,
$RESOURCEGROUP,
$CLUSTERNAME,
$NAMESPACE,
$VAULT,
$PIITOOLS_USERNAME,
$PIITOOLS_PASSWORD,
$DNSNAME,
$SUBSCRIPTIONID,
$Release.PrimaryArtifactSourceAlias)
$securePassword = ConvertTo-SecureString -String $PASSWORD -AsPlainText -Force
$credentials = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $USERNAME, $securePassword
ls
az login -u $USERNAME -p $PASSWORD

#Write-Host "Enter Resource Group name to create:"
#$RESOURCEGROUP = Read-Host

#Write-Host "Enter Cluster name:"
#$CLUSTERNAME = Read-Host

#Write-Host "Enter Namespace:"
#$NAMESPACE = Read-Host

# Name to associate with public IP address
#Write-Host "Enter domain name to use:"
#$DNSNAME = Read-Host

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
 
#az aks create --resource-group $RESOURCEGROUP --name $CLUSTERNAME --node-count 2 --enable-addons monitoring --l eastus -s Standard_D4s_v3 
az aks get-credentials --resource-group $RESOURCEGROUP --name $CLUSTERNAME --subscription $SUBSCRIPTIONID
Write-Host "Fetched credentials" 
choco install kubernetes-cli
Write-Host $([Environment]::GetEnvironmentVariable('path', 'machine'))
kubectl create namespace $NAMESPACE

kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/configMap.yaml -n $NAMESPACE
kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/persistentVol.yaml -n $NAMESPACE
kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/postgres-service.yaml -n $NAMESPACE
kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/postgres-deployment.yaml -n $NAMESPACE
Write-Host "Postgres deployed"

Write-Host "Connecting to azure RM account to gain access to azure key vault:"
Import-Module AzureRM
Login-AzureRMAccount -Credential $credentials


$DockerUserName = (((Get-AzureKeyVaultSecret -VaultName $VAULT -Name DockerUserName).SecretValueText) -replace '\n' ,'')
$DockerPassword = (((Get-AzureKeyVaultSecret -VaultName $VAULT -Name DockerPassword).SecretValueText) -replace '\n' ,'')

kubectl create secret docker-registry regcred --docker-server=registry.rare-technologies.com:5050 --docker-username=$DockerUserName --docker-password=$DockerPassword -n $NAMESPACE


kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/pii-tools-service.yaml -n $NAMESPACE
((Get-Content -path ./$Release.PrimaryArtifactSourceAlias/pii-tools-deployment.yaml -Raw) -replace 'USER_DEFINED_USERNAME', $PIITOOLS_USERNAME -replace 'USER_DEFINED_PASSWORD', $PIITOOLS_PASSWORD  -replace 'LICENSE_KEY_VALUE', $((Get-AzureKeyVaultSecret -VaultName $VAULT -Name LicenseKey).SecretValueText)) | Set-Content -Path ./$Release.PrimaryArtifactSourceAlias/pii-tools-deployment-$NAMESPACE.yaml



kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/pii-tools-deployment-$NAMESPACE.yaml -n $NAMESPACE

kubectl rollout status deployment/pii-tools -n $NAMESPACE -v9
$STATUS = $?
Write-Host $STATUS
#check the rollout status and rollback if not successful- kubectl rollout status returns a non-zero exit code if the Deployment has exceeded the progression deadline.



if(!$STATUS){
Write-Host "Error deploying PII Tools... rolling back cluster creation... this may take few minutes"
az group delete -n $RESOURCEGROUP  --yes # you can use --no-wait option if you do not want to wait for the long-running operation to finish
}
else{
Write-Host "PII Tools service deployed"
 
kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/ns-and-sa.yaml -n $NAMESPACE
Write-Host "Created service-account"

kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/loadbalancer.yaml -n $NAMESPACE

Set-Variable -Name "IP" -Value $(kubectl get svc nginx-ingress --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}" -n $NAMESPACE)

$CheckUser = 0
while($IP -eq $null){
if($CheckUser -le '50'){
  $CheckUser++
  start-sleep -s 10
  $IP = kubectl get svc nginx-ingress --template="{{range.status.loadBalancer.ingress}}{{.ip}}{{end}}" -n $NAMESPACE
  }
}
Write-Host $IP 
#add hardening for infinite loop

# Get the resource-id of the public ip
$PUBLICIPID = $(az network public-ip list --query "[?ipAddress!=null]|[?contains(ipAddress, '$IP')].[id]" --output tsv --subscription $SUBSCRIPTIONID)
Write-Host "public ip for service is " 
Write-Host $PUBLICIPID 
Write-Host $DNSNAME
# Update public ip address with DNS name
az network public-ip update --ids $PUBLICIPID --dns-name $DNSNAME --subscription $SUBSCRIPTIONID

((Get-Content -path ./$Release.PrimaryArtifactSourceAlias/piitools-ingress-cert.yaml -Raw ) -replace 'TLS_CRT', $((Get-AzureKeyVaultSecret -VaultName $VAULT -Name base64crt).SecretValueText -replace '\n' , '')  -replace 'TLS_KEY' , $((Get-AzureKeyVaultSecret -VaultName $VAULT  -Name base64key).SecretValueText).Trim() -replace '\n' , '') |Set-Content -Path ./$Release.PrimaryArtifactSourceAlias/secret.yaml
kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/secret.yaml -n $NAMESPACE

#Create a config map for customizing NGINX configuration
kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/nginx-config.yaml -n $NAMESPACE
Write-Host "Deployed nginx-config"

#If RBAC is enabled in your cluster, create a cluster role and bind it to the service account
((Get-Content -path ./$Release.PrimaryArtifactSourceAlias/rbac.yaml -Raw) -replace 'USER_DEFINED_NAMESPACE', $NAMESPACE) | Set-Content -Path ./$Release.PrimaryArtifactSourceAlias/rbac-$NAMESPACE.yaml
kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/rbac-$NAMESPACE.yaml -n $NAMESPACE
Write-Host "Deployed rbac"

kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/nginx-ingress.yaml -n $NAMESPACE
#Deploy the Ingress Controller
Write-Host "Deployed nginx-ingress"

#Deploy the Ingress 
((Get-Content -path ./$Release.PrimaryArtifactSourceAlias/ingress.yaml -Raw) -replace 'USER_DEFINED_DOMAIN', $DNSNAME) | Set-Content -Path ./$Release.PrimaryArtifactSourceAlias/ingress-$DNSNAME.yaml
kubectl apply -f ./$Release.PrimaryArtifactSourceAlias/ingress-$DNSNAME.yaml -n $NAMESPACE
Write-Host "Deployed ingress"
Write-Host "This may take few minutes, wait for sometime before accessing the URL..."
} 
#delete sensitive files

Remove-Item -path ./$Release.PrimaryArtifactSourceAlias/secret.yaml
Remove-Item -path ./$Release.PrimaryArtifactSourceAlias/pii-tools-deployment-$NAMESPACE.yaml
