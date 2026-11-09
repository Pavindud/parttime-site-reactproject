<?php
$ch = curl_init('http://localhost/parttime-site/backend/auth/login.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'employee@test.com', 'password' => 'password']));
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Origin: http://localhost:5173']);
$res = curl_exec($ch);
echo $res;
