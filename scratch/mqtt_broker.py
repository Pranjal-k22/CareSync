import asyncio
import logging
from amqtt.broker import Broker

logger = logging.getLogger("mqtt_broker")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

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
        'allow-anonymous': True,
        'plugins': ['auth_anonymous']
    },
    'topic-check': {
        'enabled': False
    }
}

async def main():
    broker = Broker(config)
    await broker.start()
    logger.info("🚀 HealConnect MQTT Broker running on ports 1883 (TCP) and 9001 (WebSocket)")
    try:
        while True:
            await asyncio.sleep(3600)
    except asyncio.CancelledError:
        await broker.shutdown()

if __name__ == '__main__':
    asyncio.run(main())
