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

requireRole('poster');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$title = trim($input['title'] ?? '');
$description = trim($input['description'] ?? '');
$pay = $input['pay'] ?? null;
$location = trim($input['location'] ?? '');

if (empty($title) || empty($description) || !is_numeric($pay) || (float)$pay < 0 || empty($location)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Valid title, description, pay, and location are required']);
    exit;
}

$posterId = (int)$_SESSION['user_id'];

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('
        INSERT INTO jobs (poster_id, title, description, pay, location, status)
        VALUES (?, ?, ?, ?, ?, "open")
    ');
    $stmt->execute([$posterId, $title, $description, (float)$pay, $location]);

    $id = (int)$pdo->lastInsertId();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $id
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
