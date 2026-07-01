# attendance\_system

\# Feature: Attendance Management



\## DB



\### Attendance Table



Create a table to store attendance records for every registered user against a specific service/workshop/session.



\*\*Table: Attendance\*\*



| Field | Description |

|---------|---------|

| Id | Primary Key |

| UserId | User ID |

| UserName | User Name Snapshot |

| ServiceId | Service/Workshop ID |

| ServiceName | Service/Workshop Name Snapshot |

| SessionDate | Date of Session |

| AttendanceStatus | P / A / ML |

| Remarks | Optional Notes |

| MarkedByAdminId | Admin User ID |

| MarkedByAdminName | Admin Name |

| MarkedDateTime | Timestamp |

| LastModifiedBy | Admin User ID |

| LastModifiedDateTime | Timestamp |



\### Attendance Audit Log



Track all attendance changes for audit purposes.



\*\*Table: AttendanceAuditLogs\*\*



| Field | Description |

|---------|---------|

| Id | Primary Key |

| AttendanceId | FK to Attendance |

| OldStatus | Previous Status |

| NewStatus | Updated Status |

| ChangedByAdminId | Admin User ID |

| ChangedDateTime | Timestamp |

| Remarks | Optional Change Reason |



\### Notes



\- Attendance is recorded per service/workshop/session.

\- A user can have different attendance records for different services.

\- Attendance history must remain available even if service or user details change later.

\- Attendance changes must be auditable.



\---



\## API / Services



\### Get Upcoming Services API



Returns all upcoming services/workshops for attendance marking.



\#### Response



\- Service Id

\- Service Name

\- Date

\- Time

\- Total Registered Users



\---



\### Get Registered Users For Service API



Returns all users registered for a selected service/workshop.



\#### Response



\- User Id

\- User Name

\- Email

\- Phone Number

\- Registration Date

\- Attendance Status (if already marked)



\---



\### Save Attendance API



Allows admin to mark attendance.



\#### Input



\- Service Id

\- User Id

\- Attendance Status



\#### Allowed Statuses



\- P (Present)

\- A (Absent)

\- ML (Medical Leave)



\#### Response



\- Success/Failure

\- Message



\---



\### Update Attendance API



Allows admin to edit previously recorded attendance.



\#### Input



\- Attendance Id

\- Updated Status

\- Optional Remarks



\#### Response



\- Success/Failure

\- Message



\#### Requirements



\- Store previous value in audit log.

\- Track who made the change.

\- Track when the change was made.



\---



\### Get Attendance History API



Returns attendance records service-wise.



\#### Filters



\- Service Name

\- Date Range

\- Attendance Status

\- User Name



\#### Response



\- Service Name

\- Session Date

\- User Name

\- Attendance Status

\- Marked By

\- Marked Date



\---



\### Get Attendance Summary API



Returns attendance statistics for a selected service/workshop.



\#### Response



\- Total Registered

\- Present Count

\- Absent Count

\- Medical Leave Count

\- Attendance Percentage



\---



\## UI



\### Admin Panel



Add a new menu item:



\# Attendance



\---



\## Tab 1: Mark Attendance



Display all upcoming services/workshops.



\### Service List



Columns:



\- Service Name

\- Date

\- Time

\- Registered Users Count

\- Mark Attendance



When admin clicks \*\*Mark Attendance\*\*, show registered users.



\### Registered Users Table



Columns:



\- User Name

\- Email

\- Phone Number

\- Attendance Status



Attendance Status Dropdown:



\- P (Present)

\- A (Absent)

\- ML (Medical Leave)



Actions:



\- Save Attendance



Bulk Actions:



\- Mark All Present

\- Mark All Absent

\- Save All



\---



\## Tab 2: Attendance History



Display attendance records for past and upcoming services.



\### Filters



\- Service Name

\- Date Range

\- User Name

\- Attendance Status



\### Attendance History Table



Columns:



\- Service Name

\- Session Date

\- User Name

\- Attendance Status

\- Last Updated By

\- Last Updated On

\- Edit



Actions:



\- Edit Attendance



\---



\## Tab 3: Service-wise Attendance Report



Attendance should primarily be viewed service/workshop wise rather than user wise.



\### Service Selection



Admin selects a service/workshop.



\### Service Attendance View



Display:



\#### Service Information



\- Service Name

\- Date

\- Total Registered



\#### Attendance Summary



\- Present Count

\- Absent Count

\- Medical Leave Count

\- Attendance Percentage



\#### Participant Table



Columns:



\- User Name

\- Email

\- Attendance Status



This allows admin to quickly see attendance for a specific service/workshop.



\---



\## UX



\### User Flow - Mark Attendance



1\. Open Admin Panel.

2\. Navigate to Attendance.

3\. Open Mark Attendance tab.

4\. Select Service/Workshop.

5\. View Registered Users.

6\. Mark attendance.

7\. Save attendance.

8\. Display confirmation message.



\---



\### User Flow - Edit Attendance



1\. Open Attendance History.

2\. Search for Service/Workshop.

3\. Open attendance record.

4\. Modify attendance status.

5\. Save changes.

6\. Record audit entry.

7\. Display confirmation message.



\---



\### Validation



\- Attendance status is mandatory.

\- Only registered users can have attendance recorded.

\- Prevent duplicate attendance records for the same user and session.



\---



\### Success Messages



Examples:



\- Attendance saved successfully.

\- Attendance updated successfully.

\- Attendance recorded for 25 participants.



\---



\### Error Messages



Examples:



\- Failed to save attendance.

\- User is not registered for this service.

\- Attendance record not found.



\---



\### Permissions \& Security



Access allowed only for:



\- Admin

\- Super Admin



Requirements:



\- Log all attendance actions.

\- Log attendance modifications.

\- Maintain audit history.

\- Prevent unauthorized access.





