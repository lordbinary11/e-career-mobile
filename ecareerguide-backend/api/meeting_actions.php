<?php
// backend/api/meeting_actions.php - Handle meeting actions for counselors

// Include CORS helper
require_once __DIR__ . '/cors_helper.php';

header('Content-Type: application/json');

// Handle preflight requests (OPTIONS) - Must exit here
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection and JWT Helper
require_once __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/jwt_helper.php';

global $pdo;

if (!isset($pdo) || !$pdo instanceof PDO) {
    http_response_code(500);
    error_log("Meeting Actions API error: PDO connection not established");
    echo json_encode(["success" => false, "error" => "Database connection error."]);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "Method not allowed. Only POST requests are accepted."]);
        exit();
    }

    // Authenticate the counselor
    $counselor_id_from_auth = authenticate_user_from_jwt($pdo, true); // 'true' implies counselor

    $data = json_decode(file_get_contents("php://input"), true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid JSON input."]);
        exit();
    }

    $meeting_id = $data['meeting_id'] ?? null;
    $action = $data['action'] ?? null; // 'accept', 'reschedule', 'cancel', 'decline'
    $new_datetime = $data['new_datetime'] ?? null; // For reschedule action
    $reason = $data['reason'] ?? null; // Optional reason for cancellation/decline

    if (!$meeting_id || !$action) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Meeting ID and action are required."]);
        exit();
    }

    // Validate action
    $valid_actions = ['accept', 'reschedule', 'cancel', 'decline'];
    if (!in_array($action, $valid_actions)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid action. Must be one of: " . implode(', ', $valid_actions)]);
        exit();
    }

    // Get counselor email from authenticated ID
    $counselor_email = null;
    $stmt_counselor = $pdo->prepare("SELECT email FROM counselors WHERE id = ?");
    $stmt_counselor->execute([$counselor_id_from_auth]);
    $counselor_info = $stmt_counselor->fetch(PDO::FETCH_ASSOC);
    if ($counselor_info) {
        $counselor_email = $counselor_info['email'];
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Counselor email not found."]);
        exit();
    }

    // Verify the meeting belongs to this counselor
    $stmt_verify = $pdo->prepare("SELECT * FROM scheduled_meetings WHERE id = ? AND counselor_email = ?");
    $stmt_verify->execute([$meeting_id, $counselor_email]);
    $meeting = $stmt_verify->fetch(PDO::FETCH_ASSOC);

    if (!$meeting) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Meeting not found or you don't have permission to modify it."]);
        exit();
    }

    // Handle different actions
    switch ($action) {
        case 'accept':
            // Update meeting status to 'accepted'
            $stmt_update = $pdo->prepare("UPDATE scheduled_meetings SET status = 'accepted' WHERE id = ?");
            $stmt_update->execute([$meeting_id]);
            
            // Send notification to student
            $notification_message = "Your meeting request has been accepted by the counselor for " . 
                                   date('Y-m-d H:i', strtotime($meeting['schedule_date'] . ' ' . $meeting['schedule_time']));
            break;

        case 'reschedule':
            if (!$new_datetime) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "New date/time is required for rescheduling."]);
                exit();
            }

            // Parse new datetime
            $date_time_parts = explode(' ', $new_datetime);
            $new_date = $date_time_parts[0] ?? null;
            $new_time = $date_time_parts[1] ?? null;

            if (!$new_date || !$new_time) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Invalid date/time format. Expected YYYY-MM-DD HH:mm:ss"]);
                exit();
            }

            // Update meeting with new date/time and status
            $stmt_update = $pdo->prepare("UPDATE scheduled_meetings SET schedule_date = ?, schedule_time = ?, status = 'rescheduled' WHERE id = ?");
            $stmt_update->execute([$new_date, $new_time, $meeting_id]);
            
            // Send notification to student
            $notification_message = "Your meeting has been rescheduled to " . date('Y-m-d H:i', strtotime($new_datetime));
            break;

        case 'cancel':
            // Update meeting status to 'cancelled'
            $stmt_update = $pdo->prepare("UPDATE scheduled_meetings SET status = 'cancelled' WHERE id = ?");
            $stmt_update->execute([$meeting_id]);
            
            // Send notification to student
            $notification_message = "Your meeting has been cancelled by the counselor.";
            if ($reason) {
                $notification_message .= " Reason: " . $reason;
            }
            break;

        case 'decline':
            // Update meeting status to 'declined'
            $stmt_update = $pdo->prepare("UPDATE scheduled_meetings SET status = 'declined' WHERE id = ?");
            $stmt_update->execute([$meeting_id]);
            
            // Send notification to student
            $notification_message = "Your meeting request has been declined by the counselor.";
            if ($reason) {
                $notification_message .= " Reason: " . $reason;
            }
            break;
    }

    // Send notification to student if we have a message
    if (isset($notification_message)) {
        // Get student user ID for notification
        $stmt_student = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt_student->execute([$meeting['user_email']]);
        $student_info = $stmt_student->fetch(PDO::FETCH_ASSOC);
        
        if ($student_info) {
            $stmt_notification = $pdo->prepare("
                INSERT INTO notifications (user_id, sender_id, type, message, related_id, is_read)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt_notification->execute([
                $student_info['id'],           // Student's user ID
                $counselor_id_from_auth,       // Counselor's ID
                'meeting_' . $action,          // Type of notification
                $notification_message,
                $meeting_id,                   // Link to the meeting
                0                              // Not read yet
            ]);
        }
    }

    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "message" => "Meeting " . $action . "ed successfully!",
        "meeting_id" => $meeting_id,
        "action" => $action
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Meeting Actions API database error: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Authorization token') !== false || strpos($e->getMessage(), 'Invalid token') !== false) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    } else {
        http_response_code(500);
        error_log("Meeting Actions API general error: " . $e->getMessage());
        echo json_encode(["success" => false, "error" => "An unexpected error occurred: " . $e->getMessage()]);
    }
}
?> 