@echo off
cd /d "c:\Users\gerry.ferlannohasanb\WMS V1\wms-3pl\backend"
git add -A
git commit -m "fix(returns): allow finding linked outbound order by outboundNo as well as id"
git push
echo Done!
