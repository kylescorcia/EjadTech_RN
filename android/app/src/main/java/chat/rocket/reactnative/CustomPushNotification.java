package chat.rocket.reactnative;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.RemoteInput;
import android.content.Intent;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.os.Bundle;
import android.app.Person;

import com.google.gson.*;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.RoundedCorners;
import com.bumptech.glide.request.RequestOptions;
import java.util.concurrent.ExecutionException;
import java.lang.InterruptedException;

import com.facebook.react.bridge.ReactApplicationContext;
import com.wix.reactnativenotifications.core.AppLaunchHelper;
import com.wix.reactnativenotifications.core.AppLifecycleFacade;
import com.wix.reactnativenotifications.core.JsIOHelper;
import com.wix.reactnativenotifications.core.notification.PushNotification;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Date;

import static com.wix.reactnativenotifications.Defs.NOTIFICATION_RECEIVED_EVENT_NAME;

public class CustomPushNotification extends PushNotification {
    public static ReactApplicationContext reactApplicationContext;

    public CustomPushNotification(Context context, Bundle bundle, AppLifecycleFacade appLifecycleFacade, AppLaunchHelper appLaunchHelper, JsIOHelper jsIoHelper) {
        super(context, bundle, appLifecycleFacade, appLaunchHelper, jsIoHelper);
        reactApplicationContext = new ReactApplicationContext(context);
    }

    private static Map<String, List<Bundle>> notificationMessages = new HashMap<String, List<Bundle>>();
    public static String KEY_REPLY = "KEY_REPLY";
    public static String NOTIFICATION_ID = "NOTIFICATION_ID";

    public static void clearMessages(int notId) {
        notificationMessages.remove(Integer.toString(notId));
    }

    @Override
    public void onReceived() throws InvalidNotificationException {
        final Bundle bundle = mNotificationProps.asBundle();

        String notId = bundle.getString("notId", "1");
        String title = bundle.getString("title");

        if (notificationMessages.get(notId) == null) {
            notificationMessages.put(notId, new ArrayList<Bundle>());
        }

        Gson gson = new Gson();
        Ejson ejson = gson.fromJson(bundle.getString("ejson", "{}"), Ejson.class);

        boolean hasSender = ejson.sender != null;

        bundle.putLong("time", new Date().getTime());
        bundle.putString("username", hasSender ? ejson.sender.username : title);
        bundle.putString("senderId", hasSender ? ejson.sender._id : "1");
        bundle.putString("avatarUri", ejson.getAvatarUri());

        notificationMessages.get(notId).add(bundle);

        super.postNotification(Integer.parseInt(notId));

        notifyReceivedToJS();
    }

    @Override
    public void onOpened() {
        Bundle bundle = mNotificationProps.asBundle();
        final String notId = bundle.getString("notId", "1");
        notificationMessages.remove(notId);
        digestNotification();
    }

    @Override
    protected Notification.Builder getNotificationBuilder(PendingIntent intent) {
        final Notification.Builder notification = new Notification.Builder(mContext);

        Bundle bundle = mNotificationProps.asBundle();
        String notId = bundle.getString("notId", "1");
        String title = bundle.getString("title");
        String message = bundle.getString("message");

        notification
            .setContentTitle(title)
            .setContentText(message)
            .setContentIntent(intent)
            .setPriority(Notification.PRIORITY_HIGH)
            .setDefaults(Notification.DEFAULT_ALL)
            .setAutoCancel(true);

        Integer notificationId = Integer.parseInt(notId);
        notificationColor(notification);
        notificationChannel(notification);
        notificationIcons(notification, bundle);
        notificationStyle(notification, notificationId, bundle);
        notificationReply(notification, notificationId, bundle);
        notificationDismiss(notification, notificationId);

        return notification;
    }

    private void notifyReceivedToJS() {
        mJsIOHelper.sendEventToJS(NOTIFICATION_RECEIVED_EVENT_NAME, mNotificationProps.asBundle(), mAppLifecycleFacade.getRunningReactContext());
    }

    private Bitmap getAvatar(String uri) {
        try {
            return Glide.with(mContext)
                .asBitmap()
                .apply(RequestOptions.bitmapTransform(new RoundedCorners(10)))
                .load(uri)
                .submit(100, 100)
                .get();
        } catch (final ExecutionException | InterruptedException e) {
            return largeIcon();
        }
    }

    private Bitmap largeIcon() {
        final Resources res = mContext.getResources();
        String packageName = mContext.getPackageName();
        int largeIconResId = res.getIdentifier("ic_launcher", "mipmap", packageName);
        Bitmap largeIconBitmap = BitmapFactory.decodeResource(res, largeIconResId);
        return largeIconBitmap;
    }

    private void notificationIcons(Notification.Builder notification, Bundle bundle) {
        final Resources res = mContext.getResources();
        String packageName = mContext.getPackageName();

        int smallIconResId = res.getIdentifier("ic_notification", "mipmap", packageName);

        Gson gson = new Gson();
        Ejson ejson = gson.fromJson(bundle.getString("ejson", "{}"), Ejson.class);

        notification.setSmallIcon(smallIconResId);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            notification.setLargeIcon(getAvatar(ejson.getAvatarUri()));
        }
    }

    private void notificationChannel(Notification.Builder notification) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            String CHANNEL_ID = "rocketchatrn_channel_01";
            String CHANNEL_NAME = "All";

            NotificationChannel channel = new NotificationChannel(CHANNEL_ID,
                                                                  CHANNEL_NAME,
                                                                  NotificationManager.IMPORTANCE_DEFAULT);

            final NotificationManager notificationManager = (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.createNotificationChannel(channel);

            notification.setChannelId(CHANNEL_ID);
        }
    }

    private String extractMessage(String message, Ejson ejson) {
        if (ejson.type != null && !ejson.type.equals("d")) {
            int pos = message.indexOf(":");
            int start = pos == -1 ? 0 : pos + 2;
            return message.substring(start, message.length());
        }
        return message;
    }

    private void notificationColor(Notification.Builder notification) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            notification.setColor(mContext.getColor(R.color.notification_text));
        }
    }

    private void notificationStyle(Notification.Builder notification, int notId, Bundle bundle) {
        List<Bundle> bundles = notificationMessages.get(Integer.toString(notId));

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) {
            Notification.InboxStyle messageStyle = new Notification.InboxStyle();
            if (bundles != null) {
                for (int i = 0; i < bundles.size(); i++) {
                    Bundle data = bundles.get(i);
                    String message = data.getString("message");

                    messageStyle.addLine(message);
                }
            }

            notification.setStyle(messageStyle);
        } else {
            Notification.MessagingStyle messageStyle;

            Gson gson = new Gson();
            Ejson ejson = gson.fromJson(bundle.getString("ejson", "{}"), Ejson.class);

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
                messageStyle = new Notification.MessagingStyle("");
            } else {
                Person sender = new Person.Builder()
                    .setKey("")
                    .setName("")
                    .build();
                messageStyle = new Notification.MessagingStyle(sender);
            }

            String title = bundle.getString("title");
            messageStyle.setConversationTitle(""); 		// hide title username

            if (bundles != null) {
                for (int i = 0; i < bundles.size(); i++) {
                    Bundle data = bundles.get(i);

                    long timestamp = data.getLong("time");
                    String message = data.getString("message");
                    String username = data.getString("username");
                    String senderId = data.getString("senderId");
                    String avatarUri = data.getString("avatarUri");

                    String m = extractMessage(message, ejson);

                    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
                        messageStyle.addMessage(m, timestamp, username);
                    } else {
                        Bitmap avatar = getAvatar(avatarUri);

                        Person.Builder sender = new Person.Builder()
                            .setKey(senderId)
                            .setName(username);

                        if (avatar != null) {
                            sender.setIcon(Icon.createWithBitmap(avatar));
                        }

                        Person person = sender.build();

                        messageStyle.addMessage(m, timestamp, person);
                    }
                }
            }

            notification.setStyle(messageStyle);
        }
    }

    private void notificationReply(Notification.Builder notification, int notificationId, Bundle bundle) {
        String notId = bundle.getString("notId", "1");
        String ejson = bundle.getString("ejson", "{}");
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N || notId.equals("1") || ejson.equals("{}")) {
            return;
        }
        String label = "Reply";

        final Resources res = mContext.getResources();
        String packageName = mContext.getPackageName();
        int smallIconResId = res.getIdentifier("ic_notification", "mipmap", packageName);

        Intent replyIntent = new Intent(mContext, ReplyBroadcast.class);
        replyIntent.setAction(KEY_REPLY);
        replyIntent.putExtra("pushNotification", bundle);

        PendingIntent replyPendingIntent = PendingIntent.getBroadcast(mContext, notificationId, replyIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        RemoteInput remoteInput = new RemoteInput.Builder(KEY_REPLY)
            .setLabel(label)
            .build();

        CharSequence title = label;
        Notification.Action replyAction = new Notification.Action.Builder(smallIconResId, title, replyPendingIntent)
            .addRemoteInput(remoteInput)
            .setAllowGeneratedReplies(true)
            .build();

        notification
            .setShowWhen(true)
            .addAction(replyAction);
    }

    private void notificationDismiss(Notification.Builder notification, int notificationId) {
        Intent intent = new Intent(mContext, DismissNotification.class);
        intent.putExtra(NOTIFICATION_ID, notificationId);

        PendingIntent dismissPendingIntent = PendingIntent.getBroadcast(mContext, notificationId, intent, 0);
        
        notification.setDeleteIntent(dismissPendingIntent);
    }

}
