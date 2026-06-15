@echo off
cd /d "c:\Users\gerry.ferlannohasanb\WMS V1\wms-3pl\backend"
git add -A
git commit -m "chore(shipping-label): resize label to 100x78mm and picklist to 70x78mm (170x78mm total)"
git push
echo Done!
