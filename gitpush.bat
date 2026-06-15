@echo off
cd /d "c:\Users\gerry.ferlannohasanb\WMS V1\wms-3pl\backend"
git add -A
git commit -m "fix(shipping-label): fix 2-page render bug by reducing sep2Y to prevent bottom overflow"
git push
echo Done!
