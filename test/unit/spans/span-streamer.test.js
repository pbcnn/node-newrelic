'use strict'
const tap = require('tap')
const SpanStreamer = require('../../../lib/spans/span-streamer')
const GrpcConnection = require('../../../lib/grpc/connection')

tap.test((t)=>{
  const spanStreamer = new SpanStreamer(
    'nr-internal.aws-us-east-2.tracing.staging-edge.nr-data.net:443',
    'abc123',
    (new GrpcConnection)
  )

  t.ok(spanStreamer, "instantiated the object")
  t.end()
})

tap.test('write(span) should return false with no stream set', (t) => {
  const spanStreamer = new SpanStreamer('nowhere.horse', 'abc123', {})

  t.notOk(spanStreamer.write({}))

  t.end()
})

tap.test('write(span) should return false when not writeable', (t) => {
  const fakeConnection = {
    connectSpans: () => {}
  }

  const spanStreamer = new SpanStreamer('nowhere.horse', 'abc123', fakeConnection)
  spanStreamer._writable = false

  t.notOk(spanStreamer.write({}))

  t.end()
})

tap.test('write(span) should return true when able to write to stream', (t) => {
  const fakeStream = {
    write: () => true
  }
  const fakeConnection = {
    connectSpans: () => fakeStream
  }
  const fakeSpan = {
    toStreamingFormat: () => {}
  }

  const spanStreamer = new SpanStreamer('noWhere.horse', 'abc123', fakeConnection)
  spanStreamer.connect(1)

  t.ok(spanStreamer.write(fakeSpan))

  t.end()
})

tap.test('write(span) should return true with backpressure', (t) => {
  const fakeStream = {
    write: () => false,
    once: () => {}
  }
  const fakeConnection = {
    connectSpans: () => fakeStream
  }
  const fakeSpan = {
    toStreamingFormat: () => {}
  }

  const spanStreamer = new SpanStreamer('noWhere.horse', 'abc123', fakeConnection)
  spanStreamer.connect(1)

  t.ok(spanStreamer.write(fakeSpan))

  t.end()
})

tap.test('write(span) should return false when stream.write throws error', (t) => {
  const fakeStream = {
    write: () => {
      throw new Error('whoa!')
    },
    once: () => {}
  }
  const fakeConnection = {
    connectSpans: () => fakeStream
  }
  const fakeSpan = {
    toStreamingFormat: () => {}
  }

  const spanStreamer = new SpanStreamer('noWhere.horse', 'abc123', fakeConnection)
  spanStreamer.connect(1)

  t.notOk(spanStreamer.write(fakeSpan))

  t.end()
})