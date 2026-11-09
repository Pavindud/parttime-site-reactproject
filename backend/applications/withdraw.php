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
$applicationId = filter_var($input['application_id'] ?? null, FILTER_VALIDATE_INT);

if (!$applicationId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing application ID']);
    exit;
}

$employeeId = (int)$_SESSION['user_id'];

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('SELECT id, employee_id, status FROM applications WHERE id = ?');
    $stmt->execute([$applicationId]);
    $app = $stmt->fetch();

    if (!$app) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Application not found']);
        exit;
    }

    if ((int)$app['employee_id'] !== $employeeId) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit;
    }

    if ($app['status'] !== 'pending') {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Only pending applications can be withdrawn.']);
        exit;
    }

    $deleteStmt = $pdo->prepare('DELETE FROM applications WHERE id = ?');
    $deleteStmt->execute([$applicationId]);

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
