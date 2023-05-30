# Doggo Share

## Project Initialization

### Login to Azure
```bash
az login
```

### Download dependencies
```bash
(cd ui; npm install)
```

```bash
(cd code; npm install)
```

### Initialize Terraform
```bash
(cd infra; terraform init)
```

## Deployment

### Create infrastructure
```bash
(cd infra; terraform apply)
```

### Get SAS token
```bash
(cd infra; terraform output -json)
```

### Replace SAS token in code ("sasToken" variable in "ui/index.js")
```bash
vim ui/index.js
```

### Build website
```bash
(cd ui; npm start)
```

### Publish cloud functions
```bash
func azure functionapp publish doggo-share
```

