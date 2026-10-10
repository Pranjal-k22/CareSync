import time
import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, rc, properties=None):
    print("Connected to MQTT Broker, subscribing to healconnect/#")
    client.subscribe("healconnect/#")

def on_message(client, userdata, msg):
    print(f"Received msg on {msg.topic}: {msg.payload.decode('utf-8')}")

client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id="test-subscriber")
client.on_connect = on_connect
client.on_message = on_message

client.connect("127.0.0.1", 1883, 60)
client.loop_start()

try:
    time.sleep(15)
finally:
    client.loop_stop()
    client.disconnect()
