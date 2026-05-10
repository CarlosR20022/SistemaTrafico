Lo que necesita instalado:

PHP 8+ → php.net

Node.js 18+ → nodejs.org

App Expo Go en su iPhone/Android → App Store o Play Store

-------Clonar repo--------

git clone https://github.com/CarlosR20022/SistemaTrafico.git

cd SistemaTrafico

------Levantar servidor web-----

cd backend

php -S 0.0.0.0:8000 index.php


--------Ingresar url----------

http://localhost:8000/web/index.php


------Se necesita ingresar la ip del computador---------

# Mac:

ipconfig getifaddr en0

# Windows:

ipconfig

# buscar "Dirección IPv4"

--------Ingresarla en app/constants/Api.ts--------

export const API_BASE = 'http://SU_IP_LOCAL:8000';

----------Instalar dependencias----------

cd app

npm install

npx expo start

------Ejecutar y levantar EXPO-------

sed -i '' "s|192.168.100.150|192.168.100.159|" ~/SistemaTrafico/app/constants/Api.ts

curl -X POST http://192.168.100.159:8000/api/predict -H "Content-Type: application/json" -d '{"lat":21.16,"lon":-86.85}' --max-time 15
