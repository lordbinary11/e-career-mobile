<?php
// backend/api/test_meetings.php - Test endpoint to show all meetings

// Include CORS helper
require_once __DIR__ . '/cors_helper.php';

header('Content-Type: application/json');

// Handle preflight requests (OPTIONS) - Must exit here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection
require_once __DIR__ . '/../db_connect.php';

global $pdo;

try {
    // Fetch ALL scheduled meetings (for testing)
    $stmt = $pdo->prepare("
        SELECT
            sm.id,
            sm.user_email,
            sm.counselor_email,
            sm.schedule_date,
            sm.schedule_time,
            sm.purpose,
            sm.status,
            sm.is_virtual_meet,
            sm.meeting_platform,
            sm.meeting_link,
            sm.created_at,
            u.full_name AS student_name,
            u.email AS student_email
        FROM
            scheduled_meetings sm
        LEFT JOIN
            users u ON sm.user_email = u.email
        ORDER BY
            sm.schedule_date DESC, sm.schedule_time DESC
    ");
    $stmt->execute();
    $meetings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Also get counselor info
    $counselor_stmt = $pdo->prepare("SELECT id, name, email FROM counselors");
    $counselor_stmt->execute();
    $counselors = $counselor_stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "meetings" => $meetings,
        "counselors" => $counselors,
        "total_meetings" => count($meetings),
        "total_counselors" => count($counselors)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "An error occurred: " . $e->getMessage()
    ]);
}
?> 