<?php

require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../config/db.php';

allowCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('SELECT id, name, email, password, role FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    $valid = password_verify($password, $user['password']);
    if (!$valid && $user['password'] === $password) {
        $valid = true;
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
        $updateStmt->execute([$newHash, $user['id']]);
    }

    if (!$valid) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    startSession();
    session_regenerate_id(true);

    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['name'] = $user['name'];
    $_SESSION['role'] = $user['role'];

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'role' => $user['role']
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
