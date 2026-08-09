import { RestaurantModel } from '../../models';
import { MQTTCredentials } from '../../types/mqttCredentialsType';
import { mqtt5, iot } from 'aws-iot-device-sdk-v2';
import queryClient from '../query/queryClient';
import getTopicsMap from './getTopicsMap';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/browser';

let client: mqtt5.Mqtt5Client | null = null;
let connectionFailures = 0;

const listenToRestaurantEvents = (restaurant: RestaurantModel) => {
    const topicsMap = getTopicsMap(restaurant);

    for (const [topic, qos, callback] of topicsMap) {
        client?.subscribe({
            subscriptions: [{ topicFilter: topic, qos }]
        });

        client?.on('messageReceived', (eventData: mqtt5.MessageReceivedEvent) => {
            if (eventData.message.topicName === topic) {
                callback(eventData.message.topicName, eventData.message.payload);
            }
        });
    }
};

const listenToConnectionEvents = () => {
    client?.on('connectionSuccess', (eventData: mqtt5.ConnectionSuccessEvent) => {
        const restaurant = queryClient.getQueryData<RestaurantModel>(['restaurant'])!;
        listenToRestaurantEvents(restaurant);

        queryClient.invalidateQueries({ queryKey: ['holidaySurvey'] });
        connectionFailures = 0;

        Sentry.addBreadcrumb({
            category: 'MQTT',
            message: 'on MQTT connected',
            data: eventData
        });
    });

    client?.on('connectionFailure', (eventData: mqtt5.ConnectionFailureEvent) => {
        connectionFailures++;
        if (connectionFailures === 5) {
            client?.stop();
            client?.close();
        }
        Sentry.addBreadcrumb({
            category: 'MQTT',
            message: 'on MQTT connection failure',
            data: eventData
        });
    });
};

export const connect = async (restaurant: RestaurantModel, mqttCredentials: MQTTCredentials) => {
    const uuid = uuidv4();

    const config = iot.AwsIotMqtt5ClientConfigBuilder.newWebsocketMqttBuilderWithCustomAuth(mqttCredentials.Host, {
        authorizerName: mqttCredentials.CustomAuthorizerName,
        tokenValue: mqttCredentials.Token,
        tokenKeyName: mqttCredentials.TokenKeyName,
        tokenSignature: mqttCredentials.Signature
    })
        .withConnectProperties({
            clientId: `live-orders_${restaurant.reference}_${uuid}`,
            keepAliveIntervalSeconds: 60
        })
        .withMinReconnectDelayMs(90000)
        .withMaxReconnectDelayMs(120000)
        .build();

    if (client) {
        client.stop();
        client.close();
    }

    client = new mqtt5.Mqtt5Client(config);

    listenToConnectionEvents();

    client.start();
};

export const disconnect = () => {
    if (client) {
        client.stop();
        client.close();
    }
};
