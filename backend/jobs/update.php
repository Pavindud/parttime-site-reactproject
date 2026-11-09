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
$jobId = filter_var($input['job_id'] ?? null, FILTER_VALIDATE_INT);
$title = trim($input['title'] ?? '');
$description = trim($input['description'] ?? '');
$pay = $input['pay'] ?? null;
$location = trim($input['location'] ?? '');

if (!$jobId || empty($title) || empty($description) || !is_numeric($pay) || (float)$pay <= 0 || empty($location)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Valid job ID, title, description, pay greater than 0, and location are required']);
    exit;
}

$posterId = (int)$_SESSION['user_id'];

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('SELECT id, poster_id FROM jobs WHERE id = ?');
    $stmt->execute([$jobId]);
    $job = $stmt->fetch();

    if (!$job) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Job not found']);
        exit;
    }

    if ((int)$job['poster_id'] !== $posterId) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit;
    }

    $updateStmt = $pdo->prepare('UPDATE jobs SET title = ?, description = ?, pay = ?, location = ? WHERE id = ?');
    $updateStmt->execute([$title, $description, (float)$pay, $location, $jobId]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => null
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
