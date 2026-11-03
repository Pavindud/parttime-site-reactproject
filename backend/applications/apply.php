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

requireRole('employee');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$jobId = filter_var($input['job_id'] ?? null, FILTER_VALIDATE_INT);

if (!$jobId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing job ID']);
    exit;
}

$employeeId = (int)$_SESSION['user_id'];

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('SELECT id, status FROM jobs WHERE id = ?');
    $stmt->execute([$jobId]);
    $job = $stmt->fetch();

    if (!$job) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Job not found']);
        exit;
    }

    if ($job['status'] !== 'open') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Job is not open']);
        exit;
    }

    $stmtApp = $pdo->prepare('SELECT id FROM applications WHERE job_id = ? AND employee_id = ?');
    $stmtApp->execute([$jobId, $employeeId]);
    if ($stmtApp->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Already applied for this job']);
        exit;
    }

    $insertStmt = $pdo->prepare('INSERT INTO applications (job_id, employee_id, status) VALUES (?, ?, "pending")');
    $insertStmt->execute([$jobId, $employeeId]);

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
