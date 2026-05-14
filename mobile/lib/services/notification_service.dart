import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter_timezone/flutter_timezone.dart';

// Conditional import
import 'notification_helper_stub.dart'
    if (dart.library.html) 'web_notification_helper.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  Future<void> init() async {
    if (kIsWeb) return; 

    // 1. Initialize Timezone
    tz.initializeTimeZones();
    final String timeZoneName = await FlutterTimezone.getLocalTimezone();
    tz.setLocalLocation(tz.getLocation(timeZoneName));

    // 2. Android Settings
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // 3. iOS Settings
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    // 4. Initialize Plugin
    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(
      settings,
      onDidReceiveNotificationResponse: (NotificationResponse details) {
        // Handle notification click here if needed
      },
    );
  }

  Future<void> requestPermissions() async {
    if (kIsWeb) {
      await WebNotificationHelper.requestPermission();
      return;
    }

    await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
    
    await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
  }

  Future<void> showInstantNotification(String title, String body) async {
    if (kIsWeb) {
      print('WebNotificationHelper.permission: ${WebNotificationHelper.permission}');
      if (WebNotificationHelper.permission == 'granted') {
        print('Showing Web Notification: $title');
        WebNotificationHelper.showNotification(title, body);
      } else {
        print('Requesting Web Notification Permissions...');
        await WebNotificationHelper.requestPermission();
        print('New WebNotificationHelper.permission: ${WebNotificationHelper.permission}');
        if (WebNotificationHelper.permission == 'granted') {
           WebNotificationHelper.showNotification(title, body);
        }
      }
      return;
    }

    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'instant_channel',
      'Instant Notifications',
      channelDescription: 'Used for instant notifications',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: DarwinNotificationDetails(),
    );

    await _notificationsPlugin.show(0, title, body, details);
  }

  Future<void> scheduleDailyReminder(int id, int hour, int minute, String title, String body) async {
    if (kIsWeb) return;

    final now = tz.TZDateTime.now(tz.local);
    var scheduledDate = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      hour,
      minute,
    );

    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }

    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'daily_reminder',
      'Daily Journal Reminder',
      channelDescription: 'Daily reminder to write in your journal',
      importance: Importance.max,
      priority: Priority.high,
    );

    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: DarwinNotificationDetails(),
    );

    await _notificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      scheduledDate,
      details,
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  Future<void> cancelAllNotifications() async {
    if (kIsWeb) return;
    await _notificationsPlugin.cancelAll();
  }
}
