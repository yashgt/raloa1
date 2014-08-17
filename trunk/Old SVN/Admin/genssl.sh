#Create a certificat
openssl genrsa -out ssl-key.pem 1024
#Create a request for obtaining a public key from the certificate
openssl req -new -key ssl-key.pem -out certrequest.csr
#using the request, get a public key signed by the original key
openssl x509 -req -in certrequest.csr -signkey ssl-key.pem -out ssl-cert.pem
