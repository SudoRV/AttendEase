
const admin = require("./src/config/fcm");

const token = "df92A5f_f75wypnitnyMjP:APA91bGKEarDmYSJxDcm2ZaMy7gfdP1EpnFzg5OAO6CZgzC8t68XRbeks_GiPsQN1Je4mro9luEsFFx2N6KDEs-E0zzPgf7BzPCO1GYy5smYQENj0GgS8oc"

async function checkTopics(fcmToken) {
    try {
        // Let firebase-admin fetch and auto-refresh the OAuth2 access token
        const accessTokenObj = await admin.app().options.credential.getAccessToken();
        const token = accessTokenObj.access_token;

        // Call the Instance Info API using standard fetch
        const response = await fetch(`https://iid.googleapis.com/iid/info/${fcmToken}?details=true`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'access_token_auth': 'true'
            }
        });

        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error);
        } else {
            console.log('Subscribed topics:', data.rel?.topics || 'No active topic subscriptions found');
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
}

checkTopics(token);