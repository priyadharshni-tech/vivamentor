rmdir /s /q .git
git init
git add .
git reset push.bat
git commit -m "Initial commit: VivaMentor AI 6-Agent Multi-Agent Platform"
git branch -M main
git remote add origin https://github.com/priyadharshni-tech/vivamentor.git
git push -u origin main --force
