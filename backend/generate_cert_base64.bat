@echo off
echo Generating base64-encoded certificate for environment variable...
echo.

if not exist isrgrootx1.pem (
  echo ERROR: isrgrootx1.pem file not found!
  echo Please run this script from the directory containing isrgrootx1.pem
  exit /b 1
)

echo Step 1: Encoding certificate...
certutil -encode isrgrootx1.pem temp.b64

echo Step 2: Cleaning up the encoded file...
findstr /v /c:- temp.b64 > cert_base64.txt

echo Step 3: Removing temporary files...
del temp.b64

echo.
echo Success! The base64-encoded certificate is in cert_base64.txt
echo.
echo Instructions:
echo 1. Open cert_base64.txt
echo 2. Copy ALL of the content (Ctrl+A, Ctrl+C)
echo 3. Go to your Vercel dashboard → Project → Settings → Environment Variables
echo 4. Add a new variable named 'DB_CA_CERT'
echo 5. Paste the entire content as the value
echo 6. Save your changes
echo 7. Redeploy your application
echo.
echo After completing these steps, the TiDB Cloud connection should work for all users.
echo. 