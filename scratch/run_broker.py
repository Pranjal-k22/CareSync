import asyncio
import sys
import os
from amqtt.broker import Broker

config = {
    'listeners': {
        'default': {
            'type': 'tcp',
            'bind': '0.0.0.0:1883',
        },
        'ws': {
            'type': 'ws',
            'bind': '0.0.0.0:9001',
        }
    },
    'sys_interval': 10,
    'auth': {
        'allow_anonymous': True,
        'plugins': ['auth_anonymous']
    }
}

async def start_broker():
    broker = Broker(config)
    await broker.start()
    print("MQTT Broker started on 0.0.0.0:1883 (TCP) and 0.0.0.0:9001 (WS)")
    while True:
        await asyncio.sleep(3600)

if __name__ == "__main__":
    try:
        asyncio.run(start_broker())
    except KeyboardInterrupt:
        print("Broker stopped")
