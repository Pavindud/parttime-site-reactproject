<?php

require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/session.php';
require_once __DIR__ . '/../config/db.php';

allowCors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

requireRole('employee');

$employeeId = (int)$_SESSION['user_id'];

try {
    $pdo = getDb();

    $stmt = $pdo->prepare('
        SELECT 
            a.id,
            a.job_id,
            j.title AS job_title,
            j.poster_id,
            u.name AS poster_name,
            a.status,
            a.applied_at,
            (
                SELECT COUNT(*) 
                FROM ratings r 
                WHERE r.job_id = a.job_id AND r.rater_id = a.employee_id AND r.rated_id = j.poster_id
            ) AS rating_count
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON j.poster_id = u.id
        WHERE a.employee_id = ?
        ORDER BY a.applied_at DESC
    ');
    $stmt->execute([$employeeId]);

    $applications = $stmt->fetchAll();
    $data = [];
    foreach ($applications as $app) {
        $data[] = [
            'id' => (int)$app['id'],
            'job_id' => (int)$app['job_id'],
            'job_title' => $app['job_title'],
            'poster_id' => (int)$app['poster_id'],
            'poster_name' => $app['poster_name'],
            'status' => $app['status'],
            'applied_at' => $app['applied_at'],
            'has_rated' => ((int)$app['rating_count'] > 0)
        ];
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
