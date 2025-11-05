import asyncio, aio_pika, time, statistics
import matplotlib.pyplot as plt

RABBIT_URL = "amqp://guest:guest@localhost/"
FANOUT_EXCHANGE = "emergency_connect"
NUM_SUBSCRIBERS = 100        # fan-out to 100 receivers
NUM_ALERTS = 500             # total alerts to test

async def subscriber(name, latencies):
    connection = await aio_pika.connect_robust(RABBIT_URL)
    channel = await connection.channel()
    exchange = await channel.declare_exchange(FANOUT_EXCHANGE, aio_pika.ExchangeType.FANOUT)
    queue = await channel.declare_queue(exclusive=True)
    await queue.bind(exchange)

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():
                sent_ts = float(message.body.decode())
                now = time.time()
                latencies.append((now - sent_ts) * 1000)   # ms
                break   # one message per subscriber in this demo

    await connection.close()

async def publisher():
    connection = await aio_pika.connect_robust(RABBIT_URL)
    channel = await connection.channel()
    exchange = await channel.declare_exchange(FANOUT_EXCHANGE, aio_pika.ExchangeType.FANOUT)
    for _ in range(NUM_ALERTS):
        ts = str(time.time())
        await exchange.publish(aio_pika.Message(body=ts.encode()), routing_key="")
        await asyncio.sleep(0.05)  # 20 alerts/sec
    await connection.close()

async def main():
    latencies = []
    subs = [asyncio.create_task(subscriber(f"S{i}", latencies)) for i in range(NUM_SUBSCRIBERS)]
    await asyncio.sleep(0.5)  # let subscribers bind
    await publisher()
    await asyncio.gather(*subs)

    print(f"Delivered {len(latencies)} messages")
    print(f"Mean latency: {statistics.mean(latencies):.2f} ms")
    print(f"Median latency: {statistics.median(latencies):.2f} ms")
    print(f"95th percentile: {sorted(latencies)[int(0.95*len(latencies))-1]:.2f} ms")

    

    plt.hist(latencies, bins=10, color='skyblue', edgecolor='black')
    plt.title('Emergency Connect Latency Distribution')
    plt.xlabel('Latency (ms)')
    plt.ylabel('Count')
    plt.show()


asyncio.run(main())
