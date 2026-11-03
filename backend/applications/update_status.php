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
$applicationId = filter_var($input['application_id'] ?? null, FILTER_VALIDATE_INT);
$status = trim($input['status'] ?? '');

$allowedStatuses = ['accepted', 'rejected', 'completed'];

if (!$applicationId || !in_array($status, $allowedStatuses, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid application ID or status']);
    exit;
}

$posterId = (int)$_SESSION['user_id'];

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('
        SELECT a.id, j.poster_id 
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.id = ?
    ');
    $stmt->execute([$applicationId]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Application not found']);
        exit;
    }

    if ((int)$row['poster_id'] !== $posterId) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit;
    }

    $updateStmt = $pdo->prepare('UPDATE applications SET status = ? WHERE id = ?');
    $updateStmt->execute([$status, $applicationId]);

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
