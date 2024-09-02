var Td = Object.create;
var lo = Object.defineProperty,
  Nd = Object.defineProperties,
  Ad = Object.getOwnPropertyDescriptor,
  Od = Object.getOwnPropertyDescriptors,
  Fd = Object.getOwnPropertyNames,
  Dn = Object.getOwnPropertySymbols,
  Rd = Object.getPrototypeOf,
  fo = Object.prototype.hasOwnProperty,
  ia = Object.prototype.propertyIsEnumerable;
var oa = (e, t, n) =>
    t in e
      ? lo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  Oe = (e, t) => {
    for (var n in (t ||= {})) fo.call(t, n) && oa(e, n, t[n]);
    if (Dn) for (var n of Dn(t)) ia.call(t, n) && oa(e, n, t[n]);
    return e;
  },
  Fe = (e, t) => Nd(e, Od(t));
var xD = (e, t) => {
  var n = {};
  for (var r in e) fo.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && Dn)
    for (var r of Dn(e)) t.indexOf(r) < 0 && ia.call(e, r) && (n[r] = e[r]);
  return n;
};
var SD = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var Pd = (e, t, n, r) => {
  if ((t && typeof t == 'object') || typeof t == 'function')
    for (let o of Fd(t))
      !fo.call(e, o) &&
        o !== n &&
        lo(e, o, {
          get: () => t[o],
          enumerable: !(r = Ad(t, o)) || r.enumerable,
        });
  return e;
};
var TD = (e, t, n) => (
  (n = e != null ? Td(Rd(e)) : {}),
  Pd(
    t || !e || !e.__esModule
      ? lo(n, 'default', { value: e, enumerable: !0 })
      : n,
    e
  )
);
var kd = (e, t, n) =>
  new Promise((r, o) => {
    var i = (u) => {
        try {
          a(n.next(u));
        } catch (c) {
          o(c);
        }
      },
      s = (u) => {
        try {
          a(n.throw(u));
        } catch (c) {
          o(c);
        }
      },
      a = (u) => (u.done ? r(u.value) : Promise.resolve(u.value).then(i, s));
    a((n = n.apply(e, t)).next());
  });
function sa(e, t) {
  return Object.is(e, t);
}
var L = null,
  In = !1,
  En = 1,
  Ee = Symbol('SIGNAL');
function b(e) {
  let t = L;
  return (L = e), t;
}
function aa() {
  return L;
}
var Wt = {
  version: 0,
  lastCleanEpoch: 0,
  dirty: !1,
  producerNode: void 0,
  producerLastReadVersion: void 0,
  producerIndexOfThis: void 0,
  nextProducerIndex: 0,
  liveConsumerNode: void 0,
  liveConsumerIndexOfThis: void 0,
  consumerAllowSignalWrites: !1,
  consumerIsAlwaysLive: !1,
  producerMustRecompute: () => !1,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {},
};
function go(e) {
  if (In) throw new Error('');
  if (L === null) return;
  L.consumerOnSignalRead(e);
  let t = L.nextProducerIndex++;
  if ((_n(L), t < L.producerNode.length && L.producerNode[t] !== e && Gt(L))) {
    let n = L.producerNode[t];
    bn(n, L.producerIndexOfThis[t]);
  }
  L.producerNode[t] !== e &&
    ((L.producerNode[t] = e),
    (L.producerIndexOfThis[t] = Gt(L) ? da(e, L, t) : 0)),
    (L.producerLastReadVersion[t] = e.version);
}
function Ld() {
  En++;
}
function ua(e) {
  if (!(Gt(e) && !e.dirty) && !(!e.dirty && e.lastCleanEpoch === En)) {
    if (!e.producerMustRecompute(e) && !yo(e)) {
      (e.dirty = !1), (e.lastCleanEpoch = En);
      return;
    }
    e.producerRecomputeValue(e), (e.dirty = !1), (e.lastCleanEpoch = En);
  }
}
function ca(e) {
  if (e.liveConsumerNode === void 0) return;
  let t = In;
  In = !0;
  try {
    for (let n of e.liveConsumerNode) n.dirty || jd(n);
  } finally {
    In = t;
  }
}
function la() {
  return L?.consumerAllowSignalWrites !== !1;
}
function jd(e) {
  (e.dirty = !0), ca(e), e.consumerMarkedDirty?.(e);
}
function Cn(e) {
  return e && (e.nextProducerIndex = 0), b(e);
}
function mo(e, t) {
  if (
    (b(t),
    !(
      !e ||
      e.producerNode === void 0 ||
      e.producerIndexOfThis === void 0 ||
      e.producerLastReadVersion === void 0
    ))
  ) {
    if (Gt(e))
      for (let n = e.nextProducerIndex; n < e.producerNode.length; n++)
        bn(e.producerNode[n], e.producerIndexOfThis[n]);
    for (; e.producerNode.length > e.nextProducerIndex; )
      e.producerNode.pop(),
        e.producerLastReadVersion.pop(),
        e.producerIndexOfThis.pop();
  }
}
function yo(e) {
  _n(e);
  for (let t = 0; t < e.producerNode.length; t++) {
    let n = e.producerNode[t],
      r = e.producerLastReadVersion[t];
    if (r !== n.version || (ua(n), r !== n.version)) return !0;
  }
  return !1;
}
function vo(e) {
  if ((_n(e), Gt(e)))
    for (let t = 0; t < e.producerNode.length; t++)
      bn(e.producerNode[t], e.producerIndexOfThis[t]);
  (e.producerNode.length =
    e.producerLastReadVersion.length =
    e.producerIndexOfThis.length =
      0),
    e.liveConsumerNode &&
      (e.liveConsumerNode.length = e.liveConsumerIndexOfThis.length = 0);
}
function da(e, t, n) {
  if ((fa(e), e.liveConsumerNode.length === 0 && ha(e)))
    for (let r = 0; r < e.producerNode.length; r++)
      e.producerIndexOfThis[r] = da(e.producerNode[r], e, r);
  return e.liveConsumerIndexOfThis.push(n), e.liveConsumerNode.push(t) - 1;
}
function bn(e, t) {
  if ((fa(e), e.liveConsumerNode.length === 1 && ha(e)))
    for (let r = 0; r < e.producerNode.length; r++)
      bn(e.producerNode[r], e.producerIndexOfThis[r]);
  let n = e.liveConsumerNode.length - 1;
  if (
    ((e.liveConsumerNode[t] = e.liveConsumerNode[n]),
    (e.liveConsumerIndexOfThis[t] = e.liveConsumerIndexOfThis[n]),
    e.liveConsumerNode.length--,
    e.liveConsumerIndexOfThis.length--,
    t < e.liveConsumerNode.length)
  ) {
    let r = e.liveConsumerIndexOfThis[t],
      o = e.liveConsumerNode[t];
    _n(o), (o.producerIndexOfThis[r] = t);
  }
}
function Gt(e) {
  return e.consumerIsAlwaysLive || (e?.liveConsumerNode?.length ?? 0) > 0;
}
function _n(e) {
  (e.producerNode ??= []),
    (e.producerIndexOfThis ??= []),
    (e.producerLastReadVersion ??= []);
}
function fa(e) {
  (e.liveConsumerNode ??= []), (e.liveConsumerIndexOfThis ??= []);
}
function ha(e) {
  return e.producerNode !== void 0;
}
function pa(e) {
  let t = Object.create(Vd);
  t.computation = e;
  let n = () => {
    if ((ua(t), go(t), t.value === wn)) throw t.error;
    return t.value;
  };
  return (n[Ee] = t), n;
}
var ho = Symbol('UNSET'),
  po = Symbol('COMPUTING'),
  wn = Symbol('ERRORED'),
  Vd = Fe(Oe({}, Wt), {
    value: ho,
    dirty: !0,
    error: null,
    equal: sa,
    producerMustRecompute(e) {
      return e.value === ho || e.value === po;
    },
    producerRecomputeValue(e) {
      if (e.value === po) throw new Error('Detected cycle in computations.');
      let t = e.value;
      e.value = po;
      let n = Cn(e),
        r;
      try {
        r = e.computation();
      } catch (o) {
        (r = wn), (e.error = o);
      } finally {
        mo(e, n);
      }
      if (t !== ho && t !== wn && r !== wn && e.equal(t, r)) {
        e.value = t;
        return;
      }
      (e.value = r), e.version++;
    },
  });
function Bd() {
  throw new Error();
}
var ga = Bd;
function ma() {
  ga();
}
function ya(e) {
  ga = e;
}
var $d = null;
function va(e) {
  let t = Object.create(Ia);
  t.value = e;
  let n = () => (go(t), t.value);
  return (n[Ee] = t), n;
}
function Do(e, t) {
  la() || ma(), e.equal(e.value, t) || ((e.value = t), Hd(e));
}
function Da(e, t) {
  la() || ma(), Do(e, t(e.value));
}
var Ia = Fe(Oe({}, Wt), { equal: sa, value: void 0 });
function Hd(e) {
  e.version++, Ld(), ca(e), $d?.();
}
function m(e) {
  return typeof e == 'function';
}
function gt(e) {
  let n = e((r) => {
    Error.call(r), (r.stack = new Error().stack);
  });
  return (
    (n.prototype = Object.create(Error.prototype)),
    (n.prototype.constructor = n),
    n
  );
}
var Mn = gt(
  (e) =>
    function (n) {
      e(this),
        (this.message = n
          ? `${n.length} errors occurred during unsubscription:
${n.map((r, o) => `${o + 1}) ${r.toString()}`).join(`
  `)}`
          : ''),
        (this.name = 'UnsubscriptionError'),
        (this.errors = n);
    }
);
function We(e, t) {
  if (e) {
    let n = e.indexOf(t);
    0 <= n && e.splice(n, 1);
  }
}
var k = class e {
  constructor(t) {
    (this.initialTeardown = t),
      (this.closed = !1),
      (this._parentage = null),
      (this._finalizers = null);
  }
  unsubscribe() {
    let t;
    if (!this.closed) {
      this.closed = !0;
      let { _parentage: n } = this;
      if (n)
        if (((this._parentage = null), Array.isArray(n)))
          for (let i of n) i.remove(this);
        else n.remove(this);
      let { initialTeardown: r } = this;
      if (m(r))
        try {
          r();
        } catch (i) {
          t = i instanceof Mn ? i.errors : [i];
        }
      let { _finalizers: o } = this;
      if (o) {
        this._finalizers = null;
        for (let i of o)
          try {
            Ea(i);
          } catch (s) {
            (t = t ?? []),
              s instanceof Mn ? (t = [...t, ...s.errors]) : t.push(s);
          }
      }
      if (t) throw new Mn(t);
    }
  }
  add(t) {
    var n;
    if (t && t !== this)
      if (this.closed) Ea(t);
      else {
        if (t instanceof e) {
          if (t.closed || t._hasParent(this)) return;
          t._addParent(this);
        }
        (this._finalizers =
          (n = this._finalizers) !== null && n !== void 0 ? n : []).push(t);
      }
  }
  _hasParent(t) {
    let { _parentage: n } = this;
    return n === t || (Array.isArray(n) && n.includes(t));
  }
  _addParent(t) {
    let { _parentage: n } = this;
    this._parentage = Array.isArray(n) ? (n.push(t), n) : n ? [n, t] : t;
  }
  _removeParent(t) {
    let { _parentage: n } = this;
    n === t ? (this._parentage = null) : Array.isArray(n) && We(n, t);
  }
  remove(t) {
    let { _finalizers: n } = this;
    n && We(n, t), t instanceof e && t._removeParent(this);
  }
};
k.EMPTY = (() => {
  let e = new k();
  return (e.closed = !0), e;
})();
var Io = k.EMPTY;
function xn(e) {
  return (
    e instanceof k ||
    (e && 'closed' in e && m(e.remove) && m(e.add) && m(e.unsubscribe))
  );
}
function Ea(e) {
  m(e) ? e() : e.unsubscribe();
}
var ue = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1,
};
var mt = {
  setTimeout(e, t, ...n) {
    let { delegate: r } = mt;
    return r?.setTimeout ? r.setTimeout(e, t, ...n) : setTimeout(e, t, ...n);
  },
  clearTimeout(e) {
    let { delegate: t } = mt;
    return (t?.clearTimeout || clearTimeout)(e);
  },
  delegate: void 0,
};
function Sn(e) {
  mt.setTimeout(() => {
    let { onUnhandledError: t } = ue;
    if (t) t(e);
    else throw e;
  });
}
function qt() {}
var wa = Eo('C', void 0, void 0);
function Ca(e) {
  return Eo('E', void 0, e);
}
function ba(e) {
  return Eo('N', e, void 0);
}
function Eo(e, t, n) {
  return { kind: e, value: t, error: n };
}
var qe = null;
function yt(e) {
  if (ue.useDeprecatedSynchronousErrorHandling) {
    let t = !qe;
    if ((t && (qe = { errorThrown: !1, error: null }), e(), t)) {
      let { errorThrown: n, error: r } = qe;
      if (((qe = null), n)) throw r;
    }
  } else e();
}
function _a(e) {
  ue.useDeprecatedSynchronousErrorHandling &&
    qe &&
    ((qe.errorThrown = !0), (qe.error = e));
}
var Ze = class extends k {
    constructor(t) {
      super(),
        (this.isStopped = !1),
        t
          ? ((this.destination = t), xn(t) && t.add(this))
          : (this.destination = Gd);
    }
    static create(t, n, r) {
      return new we(t, n, r);
    }
    next(t) {
      this.isStopped ? Co(ba(t), this) : this._next(t);
    }
    error(t) {
      this.isStopped
        ? Co(Ca(t), this)
        : ((this.isStopped = !0), this._error(t));
    }
    complete() {
      this.isStopped ? Co(wa, this) : ((this.isStopped = !0), this._complete());
    }
    unsubscribe() {
      this.closed ||
        ((this.isStopped = !0), super.unsubscribe(), (this.destination = null));
    }
    _next(t) {
      this.destination.next(t);
    }
    _error(t) {
      try {
        this.destination.error(t);
      } finally {
        this.unsubscribe();
      }
    }
    _complete() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    }
  },
  Ud = Function.prototype.bind;
function wo(e, t) {
  return Ud.call(e, t);
}
var bo = class {
    constructor(t) {
      this.partialObserver = t;
    }
    next(t) {
      let { partialObserver: n } = this;
      if (n.next)
        try {
          n.next(t);
        } catch (r) {
          Tn(r);
        }
    }
    error(t) {
      let { partialObserver: n } = this;
      if (n.error)
        try {
          n.error(t);
        } catch (r) {
          Tn(r);
        }
      else Tn(t);
    }
    complete() {
      let { partialObserver: t } = this;
      if (t.complete)
        try {
          t.complete();
        } catch (n) {
          Tn(n);
        }
    }
  },
  we = class extends Ze {
    constructor(t, n, r) {
      super();
      let o;
      if (m(t) || !t)
        o = { next: t ?? void 0, error: n ?? void 0, complete: r ?? void 0 };
      else {
        let i;
        this && ue.useDeprecatedNextContext
          ? ((i = Object.create(t)),
            (i.unsubscribe = () => this.unsubscribe()),
            (o = {
              next: t.next && wo(t.next, i),
              error: t.error && wo(t.error, i),
              complete: t.complete && wo(t.complete, i),
            }))
          : (o = t);
      }
      this.destination = new bo(o);
    }
  };
function Tn(e) {
  ue.useDeprecatedSynchronousErrorHandling ? _a(e) : Sn(e);
}
function zd(e) {
  throw e;
}
function Co(e, t) {
  let { onStoppedNotification: n } = ue;
  n && mt.setTimeout(() => n(e, t));
}
var Gd = { closed: !0, next: qt, error: zd, complete: qt };
var vt = (typeof Symbol == 'function' && Symbol.observable) || '@@observable';
function G(e) {
  return e;
}
function Wd(...e) {
  return _o(e);
}
function _o(e) {
  return e.length === 0
    ? G
    : e.length === 1
      ? e[0]
      : function (n) {
          return e.reduce((r, o) => o(r), n);
        };
}
var M = (() => {
  class e {
    constructor(n) {
      n && (this._subscribe = n);
    }
    lift(n) {
      let r = new e();
      return (r.source = this), (r.operator = n), r;
    }
    subscribe(n, r, o) {
      let i = Zd(n) ? n : new we(n, r, o);
      return (
        yt(() => {
          let { operator: s, source: a } = this;
          i.add(
            s ? s.call(i, a) : a ? this._subscribe(i) : this._trySubscribe(i)
          );
        }),
        i
      );
    }
    _trySubscribe(n) {
      try {
        return this._subscribe(n);
      } catch (r) {
        n.error(r);
      }
    }
    forEach(n, r) {
      return (
        (r = Ma(r)),
        new r((o, i) => {
          let s = new we({
            next: (a) => {
              try {
                n(a);
              } catch (u) {
                i(u), s.unsubscribe();
              }
            },
            error: i,
            complete: o,
          });
          this.subscribe(s);
        })
      );
    }
    _subscribe(n) {
      var r;
      return (r = this.source) === null || r === void 0
        ? void 0
        : r.subscribe(n);
    }
    [vt]() {
      return this;
    }
    pipe(...n) {
      return _o(n)(this);
    }
    toPromise(n) {
      return (
        (n = Ma(n)),
        new n((r, o) => {
          let i;
          this.subscribe(
            (s) => (i = s),
            (s) => o(s),
            () => r(i)
          );
        })
      );
    }
  }
  return (e.create = (t) => new e(t)), e;
})();
function Ma(e) {
  var t;
  return (t = e ?? ue.Promise) !== null && t !== void 0 ? t : Promise;
}
function qd(e) {
  return e && m(e.next) && m(e.error) && m(e.complete);
}
function Zd(e) {
  return (e && e instanceof Ze) || (qd(e) && xn(e));
}
function Mo(e) {
  return m(e?.lift);
}
function D(e) {
  return (t) => {
    if (Mo(t))
      return t.lift(function (n) {
        try {
          return e(n, this);
        } catch (r) {
          this.error(r);
        }
      });
    throw new TypeError('Unable to lift unknown Observable type');
  };
}
function I(e, t, n, r, o) {
  return new xo(e, t, n, r, o);
}
var xo = class extends Ze {
  constructor(t, n, r, o, i, s) {
    super(t),
      (this.onFinalize = i),
      (this.shouldUnsubscribe = s),
      (this._next = n
        ? function (a) {
            try {
              n(a);
            } catch (u) {
              t.error(u);
            }
          }
        : super._next),
      (this._error = o
        ? function (a) {
            try {
              o(a);
            } catch (u) {
              t.error(u);
            } finally {
              this.unsubscribe();
            }
          }
        : super._error),
      (this._complete = r
        ? function () {
            try {
              r();
            } catch (a) {
              t.error(a);
            } finally {
              this.unsubscribe();
            }
          }
        : super._complete);
  }
  unsubscribe() {
    var t;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      let { closed: n } = this;
      super.unsubscribe(),
        !n && ((t = this.onFinalize) === null || t === void 0 || t.call(this));
    }
  }
};
function So() {
  return D((e, t) => {
    let n = null;
    e._refCount++;
    let r = I(t, void 0, void 0, void 0, () => {
      if (!e || e._refCount <= 0 || 0 < --e._refCount) {
        n = null;
        return;
      }
      let o = e._connection,
        i = n;
      (n = null), o && (!i || o === i) && o.unsubscribe(), t.unsubscribe();
    });
    e.subscribe(r), r.closed || (n = e.connect());
  });
}
var To = class extends M {
  constructor(t, n) {
    super(),
      (this.source = t),
      (this.subjectFactory = n),
      (this._subject = null),
      (this._refCount = 0),
      (this._connection = null),
      Mo(t) && (this.lift = t.lift);
  }
  _subscribe(t) {
    return this.getSubject().subscribe(t);
  }
  getSubject() {
    let t = this._subject;
    return (
      (!t || t.isStopped) && (this._subject = this.subjectFactory()),
      this._subject
    );
  }
  _teardown() {
    this._refCount = 0;
    let { _connection: t } = this;
    (this._subject = this._connection = null), t?.unsubscribe();
  }
  connect() {
    let t = this._connection;
    if (!t) {
      t = this._connection = new k();
      let n = this.getSubject();
      t.add(
        this.source.subscribe(
          I(
            n,
            void 0,
            () => {
              this._teardown(), n.complete();
            },
            (r) => {
              this._teardown(), n.error(r);
            },
            () => this._teardown()
          )
        )
      ),
        t.closed && ((this._connection = null), (t = k.EMPTY));
    }
    return t;
  }
  refCount() {
    return So()(this);
  }
};
var xa = gt(
  (e) =>
    function () {
      e(this),
        (this.name = 'ObjectUnsubscribedError'),
        (this.message = 'object unsubscribed');
    }
);
var re = (() => {
    class e extends M {
      constructor() {
        super(),
          (this.closed = !1),
          (this.currentObservers = null),
          (this.observers = []),
          (this.isStopped = !1),
          (this.hasError = !1),
          (this.thrownError = null);
      }
      lift(n) {
        let r = new Nn(this, this);
        return (r.operator = n), r;
      }
      _throwIfClosed() {
        if (this.closed) throw new xa();
      }
      next(n) {
        yt(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            this.currentObservers ||
              (this.currentObservers = Array.from(this.observers));
            for (let r of this.currentObservers) r.next(n);
          }
        });
      }
      error(n) {
        yt(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            (this.hasError = this.isStopped = !0), (this.thrownError = n);
            let { observers: r } = this;
            for (; r.length; ) r.shift().error(n);
          }
        });
      }
      complete() {
        yt(() => {
          if ((this._throwIfClosed(), !this.isStopped)) {
            this.isStopped = !0;
            let { observers: n } = this;
            for (; n.length; ) n.shift().complete();
          }
        });
      }
      unsubscribe() {
        (this.isStopped = this.closed = !0),
          (this.observers = this.currentObservers = null);
      }
      get observed() {
        var n;
        return (
          ((n = this.observers) === null || n === void 0 ? void 0 : n.length) >
          0
        );
      }
      _trySubscribe(n) {
        return this._throwIfClosed(), super._trySubscribe(n);
      }
      _subscribe(n) {
        return (
          this._throwIfClosed(),
          this._checkFinalizedStatuses(n),
          this._innerSubscribe(n)
        );
      }
      _innerSubscribe(n) {
        let { hasError: r, isStopped: o, observers: i } = this;
        return r || o
          ? Io
          : ((this.currentObservers = null),
            i.push(n),
            new k(() => {
              (this.currentObservers = null), We(i, n);
            }));
      }
      _checkFinalizedStatuses(n) {
        let { hasError: r, thrownError: o, isStopped: i } = this;
        r ? n.error(o) : i && n.complete();
      }
      asObservable() {
        let n = new M();
        return (n.source = this), n;
      }
    }
    return (e.create = (t, n) => new Nn(t, n)), e;
  })(),
  Nn = class extends re {
    constructor(t, n) {
      super(), (this.destination = t), (this.source = n);
    }
    next(t) {
      var n, r;
      (r =
        (n = this.destination) === null || n === void 0 ? void 0 : n.next) ===
        null ||
        r === void 0 ||
        r.call(n, t);
    }
    error(t) {
      var n, r;
      (r =
        (n = this.destination) === null || n === void 0 ? void 0 : n.error) ===
        null ||
        r === void 0 ||
        r.call(n, t);
    }
    complete() {
      var t, n;
      (n =
        (t = this.destination) === null || t === void 0
          ? void 0
          : t.complete) === null ||
        n === void 0 ||
        n.call(t);
    }
    _subscribe(t) {
      var n, r;
      return (r =
        (n = this.source) === null || n === void 0
          ? void 0
          : n.subscribe(t)) !== null && r !== void 0
        ? r
        : Io;
    }
  };
var Zt = class extends re {
  constructor(t) {
    super(), (this._value = t);
  }
  get value() {
    return this.getValue();
  }
  _subscribe(t) {
    let n = super._subscribe(t);
    return !n.closed && t.next(this._value), n;
  }
  getValue() {
    let { hasError: t, thrownError: n, _value: r } = this;
    if (t) throw n;
    return this._throwIfClosed(), r;
  }
  next(t) {
    super.next((this._value = t));
  }
};
var Yt = {
  now() {
    return (Yt.delegate || Date).now();
  },
  delegate: void 0,
};
var An = class extends re {
  constructor(t = 1 / 0, n = 1 / 0, r = Yt) {
    super(),
      (this._bufferSize = t),
      (this._windowTime = n),
      (this._timestampProvider = r),
      (this._buffer = []),
      (this._infiniteTimeWindow = !0),
      (this._infiniteTimeWindow = n === 1 / 0),
      (this._bufferSize = Math.max(1, t)),
      (this._windowTime = Math.max(1, n));
  }
  next(t) {
    let {
      isStopped: n,
      _buffer: r,
      _infiniteTimeWindow: o,
      _timestampProvider: i,
      _windowTime: s,
    } = this;
    n || (r.push(t), !o && r.push(i.now() + s)),
      this._trimBuffer(),
      super.next(t);
  }
  _subscribe(t) {
    this._throwIfClosed(), this._trimBuffer();
    let n = this._innerSubscribe(t),
      { _infiniteTimeWindow: r, _buffer: o } = this,
      i = o.slice();
    for (let s = 0; s < i.length && !t.closed; s += r ? 1 : 2) t.next(i[s]);
    return this._checkFinalizedStatuses(t), n;
  }
  _trimBuffer() {
    let {
        _bufferSize: t,
        _timestampProvider: n,
        _buffer: r,
        _infiniteTimeWindow: o,
      } = this,
      i = (o ? 1 : 2) * t;
    if ((t < 1 / 0 && i < r.length && r.splice(0, r.length - i), !o)) {
      let s = n.now(),
        a = 0;
      for (let u = 1; u < r.length && r[u] <= s; u += 2) a = u;
      a && r.splice(0, a + 1);
    }
  }
};
var On = class extends k {
  constructor(t, n) {
    super();
  }
  schedule(t, n = 0) {
    return this;
  }
};
var Qt = {
  setInterval(e, t, ...n) {
    let { delegate: r } = Qt;
    return r?.setInterval ? r.setInterval(e, t, ...n) : setInterval(e, t, ...n);
  },
  clearInterval(e) {
    let { delegate: t } = Qt;
    return (t?.clearInterval || clearInterval)(e);
  },
  delegate: void 0,
};
var Fn = class extends On {
  constructor(t, n) {
    super(t, n), (this.scheduler = t), (this.work = n), (this.pending = !1);
  }
  schedule(t, n = 0) {
    var r;
    if (this.closed) return this;
    this.state = t;
    let o = this.id,
      i = this.scheduler;
    return (
      o != null && (this.id = this.recycleAsyncId(i, o, n)),
      (this.pending = !0),
      (this.delay = n),
      (this.id =
        (r = this.id) !== null && r !== void 0
          ? r
          : this.requestAsyncId(i, this.id, n)),
      this
    );
  }
  requestAsyncId(t, n, r = 0) {
    return Qt.setInterval(t.flush.bind(t, this), r);
  }
  recycleAsyncId(t, n, r = 0) {
    if (r != null && this.delay === r && this.pending === !1) return n;
    n != null && Qt.clearInterval(n);
  }
  execute(t, n) {
    if (this.closed) return new Error('executing a cancelled action');
    this.pending = !1;
    let r = this._execute(t, n);
    if (r) return r;
    this.pending === !1 &&
      this.id != null &&
      (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
  }
  _execute(t, n) {
    let r = !1,
      o;
    try {
      this.work(t);
    } catch (i) {
      (r = !0), (o = i || new Error('Scheduled action threw falsy error'));
    }
    if (r) return this.unsubscribe(), o;
  }
  unsubscribe() {
    if (!this.closed) {
      let { id: t, scheduler: n } = this,
        { actions: r } = n;
      (this.work = this.state = this.scheduler = null),
        (this.pending = !1),
        We(r, this),
        t != null && (this.id = this.recycleAsyncId(n, t, null)),
        (this.delay = null),
        super.unsubscribe();
    }
  }
};
var Dt = class e {
  constructor(t, n = e.now) {
    (this.schedulerActionCtor = t), (this.now = n);
  }
  schedule(t, n = 0, r) {
    return new this.schedulerActionCtor(this, t).schedule(r, n);
  }
};
Dt.now = Yt.now;
var Rn = class extends Dt {
  constructor(t, n = Dt.now) {
    super(t, n), (this.actions = []), (this._active = !1);
  }
  flush(t) {
    let { actions: n } = this;
    if (this._active) {
      n.push(t);
      return;
    }
    let r;
    this._active = !0;
    do if ((r = t.execute(t.state, t.delay))) break;
    while ((t = n.shift()));
    if (((this._active = !1), r)) {
      for (; (t = n.shift()); ) t.unsubscribe();
      throw r;
    }
  }
};
var Kt = new Rn(Fn),
  Sa = Kt;
var Ye = new M((e) => e.complete());
function Pn(e) {
  return e && m(e.schedule);
}
function No(e) {
  return e[e.length - 1];
}
function kn(e) {
  return m(No(e)) ? e.pop() : void 0;
}
function he(e) {
  return Pn(No(e)) ? e.pop() : void 0;
}
function Ta(e, t) {
  return typeof No(e) == 'number' ? e.pop() : t;
}
function Aa(e, t, n, r) {
  function o(i) {
    return i instanceof n
      ? i
      : new n(function (s) {
          s(i);
        });
  }
  return new (n || (n = Promise))(function (i, s) {
    function a(l) {
      try {
        c(r.next(l));
      } catch (d) {
        s(d);
      }
    }
    function u(l) {
      try {
        c(r.throw(l));
      } catch (d) {
        s(d);
      }
    }
    function c(l) {
      l.done ? i(l.value) : o(l.value).then(a, u);
    }
    c((r = r.apply(e, t || [])).next());
  });
}
function Na(e) {
  var t = typeof Symbol == 'function' && Symbol.iterator,
    n = t && e[t],
    r = 0;
  if (n) return n.call(e);
  if (e && typeof e.length == 'number')
    return {
      next: function () {
        return (
          e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }
        );
      },
    };
  throw new TypeError(
    t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.'
  );
}
function Qe(e) {
  return this instanceof Qe ? ((this.v = e), this) : new Qe(e);
}
function Oa(e, t, n) {
  if (!Symbol.asyncIterator)
    throw new TypeError('Symbol.asyncIterator is not defined.');
  var r = n.apply(e, t || []),
    o,
    i = [];
  return (
    (o = {}),
    a('next'),
    a('throw'),
    a('return', s),
    (o[Symbol.asyncIterator] = function () {
      return this;
    }),
    o
  );
  function s(f) {
    return function (p) {
      return Promise.resolve(p).then(f, d);
    };
  }
  function a(f, p) {
    r[f] &&
      ((o[f] = function (g) {
        return new Promise(function (T, C) {
          i.push([f, g, T, C]) > 1 || u(f, g);
        });
      }),
      p && (o[f] = p(o[f])));
  }
  function u(f, p) {
    try {
      c(r[f](p));
    } catch (g) {
      h(i[0][3], g);
    }
  }
  function c(f) {
    f.value instanceof Qe
      ? Promise.resolve(f.value.v).then(l, d)
      : h(i[0][2], f);
  }
  function l(f) {
    u('next', f);
  }
  function d(f) {
    u('throw', f);
  }
  function h(f, p) {
    f(p), i.shift(), i.length && u(i[0][0], i[0][1]);
  }
}
function Fa(e) {
  if (!Symbol.asyncIterator)
    throw new TypeError('Symbol.asyncIterator is not defined.');
  var t = e[Symbol.asyncIterator],
    n;
  return t
    ? t.call(e)
    : ((e = typeof Na == 'function' ? Na(e) : e[Symbol.iterator]()),
      (n = {}),
      r('next'),
      r('throw'),
      r('return'),
      (n[Symbol.asyncIterator] = function () {
        return this;
      }),
      n);
  function r(i) {
    n[i] =
      e[i] &&
      function (s) {
        return new Promise(function (a, u) {
          (s = e[i](s)), o(a, u, s.done, s.value);
        });
      };
  }
  function o(i, s, a, u) {
    Promise.resolve(u).then(function (c) {
      i({ value: c, done: a });
    }, s);
  }
}
var It = (e) => e && typeof e.length == 'number' && typeof e != 'function';
function Ln(e) {
  return m(e?.then);
}
function jn(e) {
  return m(e[vt]);
}
function Vn(e) {
  return Symbol.asyncIterator && m(e?.[Symbol.asyncIterator]);
}
function Bn(e) {
  return new TypeError(
    `You provided ${e !== null && typeof e == 'object' ? 'an invalid object' : `'${e}'`} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`
  );
}
function Yd() {
  return typeof Symbol != 'function' || !Symbol.iterator
    ? '@@iterator'
    : Symbol.iterator;
}
var $n = Yd();
function Hn(e) {
  return m(e?.[$n]);
}
function Un(e) {
  return Oa(this, arguments, function* () {
    let n = e.getReader();
    try {
      for (;;) {
        let { value: r, done: o } = yield Qe(n.read());
        if (o) return yield Qe(void 0);
        yield yield Qe(r);
      }
    } finally {
      n.releaseLock();
    }
  });
}
function zn(e) {
  return m(e?.getReader);
}
function N(e) {
  if (e instanceof M) return e;
  if (e != null) {
    if (jn(e)) return Qd(e);
    if (It(e)) return Kd(e);
    if (Ln(e)) return Jd(e);
    if (Vn(e)) return Ra(e);
    if (Hn(e)) return Xd(e);
    if (zn(e)) return ef(e);
  }
  throw Bn(e);
}
function Qd(e) {
  return new M((t) => {
    let n = e[vt]();
    if (m(n.subscribe)) return n.subscribe(t);
    throw new TypeError(
      'Provided object does not correctly implement Symbol.observable'
    );
  });
}
function Kd(e) {
  return new M((t) => {
    for (let n = 0; n < e.length && !t.closed; n++) t.next(e[n]);
    t.complete();
  });
}
function Jd(e) {
  return new M((t) => {
    e.then(
      (n) => {
        t.closed || (t.next(n), t.complete());
      },
      (n) => t.error(n)
    ).then(null, Sn);
  });
}
function Xd(e) {
  return new M((t) => {
    for (let n of e) if ((t.next(n), t.closed)) return;
    t.complete();
  });
}
function Ra(e) {
  return new M((t) => {
    tf(e, t).catch((n) => t.error(n));
  });
}
function ef(e) {
  return Ra(Un(e));
}
function tf(e, t) {
  var n, r, o, i;
  return Aa(this, void 0, void 0, function* () {
    try {
      for (n = Fa(e); (r = yield n.next()), !r.done; ) {
        let s = r.value;
        if ((t.next(s), t.closed)) return;
      }
    } catch (s) {
      o = { error: s };
    } finally {
      try {
        r && !r.done && (i = n.return) && (yield i.call(n));
      } finally {
        if (o) throw o.error;
      }
    }
    t.complete();
  });
}
function Z(e, t, n, r = 0, o = !1) {
  let i = t.schedule(function () {
    n(), o ? e.add(this.schedule(null, r)) : this.unsubscribe();
  }, r);
  if ((e.add(i), !o)) return i;
}
function Gn(e, t = 0) {
  return D((n, r) => {
    n.subscribe(
      I(
        r,
        (o) => Z(r, e, () => r.next(o), t),
        () => Z(r, e, () => r.complete(), t),
        (o) => Z(r, e, () => r.error(o), t)
      )
    );
  });
}
function Wn(e, t = 0) {
  return D((n, r) => {
    r.add(e.schedule(() => n.subscribe(r), t));
  });
}
function Pa(e, t) {
  return N(e).pipe(Wn(t), Gn(t));
}
function ka(e, t) {
  return N(e).pipe(Wn(t), Gn(t));
}
function La(e, t) {
  return new M((n) => {
    let r = 0;
    return t.schedule(function () {
      r === e.length
        ? n.complete()
        : (n.next(e[r++]), n.closed || this.schedule());
    });
  });
}
function ja(e, t) {
  return new M((n) => {
    let r;
    return (
      Z(n, t, () => {
        (r = e[$n]()),
          Z(
            n,
            t,
            () => {
              let o, i;
              try {
                ({ value: o, done: i } = r.next());
              } catch (s) {
                n.error(s);
                return;
              }
              i ? n.complete() : n.next(o);
            },
            0,
            !0
          );
      }),
      () => m(r?.return) && r.return()
    );
  });
}
function qn(e, t) {
  if (!e) throw new Error('Iterable cannot be null');
  return new M((n) => {
    Z(n, t, () => {
      let r = e[Symbol.asyncIterator]();
      Z(
        n,
        t,
        () => {
          r.next().then((o) => {
            o.done ? n.complete() : n.next(o.value);
          });
        },
        0,
        !0
      );
    });
  });
}
function Va(e, t) {
  return qn(Un(e), t);
}
function Ba(e, t) {
  if (e != null) {
    if (jn(e)) return Pa(e, t);
    if (It(e)) return La(e, t);
    if (Ln(e)) return ka(e, t);
    if (Vn(e)) return qn(e, t);
    if (Hn(e)) return ja(e, t);
    if (zn(e)) return Va(e, t);
  }
  throw Bn(e);
}
function pe(e, t) {
  return t ? Ba(e, t) : N(e);
}
function nf(...e) {
  let t = he(e);
  return pe(e, t);
}
function rf(e, t) {
  let n = m(e) ? e : () => e,
    r = (o) => o.error(n());
  return new M(t ? (o) => t.schedule(r, 0, o) : r);
}
function of(e) {
  return !!e && (e instanceof M || (m(e.lift) && m(e.subscribe)));
}
var Ke = gt(
  (e) =>
    function () {
      e(this),
        (this.name = 'EmptyError'),
        (this.message = 'no elements in sequence');
    }
);
function $a(e) {
  return e instanceof Date && !isNaN(e);
}
function Ce(e, t) {
  return D((n, r) => {
    let o = 0;
    n.subscribe(
      I(r, (i) => {
        r.next(e.call(t, i, o++));
      })
    );
  });
}
var { isArray: sf } = Array;
function af(e, t) {
  return sf(t) ? e(...t) : e(t);
}
function Et(e) {
  return Ce((t) => af(e, t));
}
var { isArray: uf } = Array,
  { getPrototypeOf: cf, prototype: lf, keys: df } = Object;
function Zn(e) {
  if (e.length === 1) {
    let t = e[0];
    if (uf(t)) return { args: t, keys: null };
    if (ff(t)) {
      let n = df(t);
      return { args: n.map((r) => t[r]), keys: n };
    }
  }
  return { args: e, keys: null };
}
function ff(e) {
  return e && typeof e == 'object' && cf(e) === lf;
}
function Yn(e, t) {
  return e.reduce((n, r, o) => ((n[r] = t[o]), n), {});
}
function hf(...e) {
  let t = he(e),
    n = kn(e),
    { args: r, keys: o } = Zn(e);
  if (r.length === 0) return pe([], t);
  let i = new M(pf(r, t, o ? (s) => Yn(o, s) : G));
  return n ? i.pipe(Et(n)) : i;
}
function pf(e, t, n = G) {
  return (r) => {
    Ha(
      t,
      () => {
        let { length: o } = e,
          i = new Array(o),
          s = o,
          a = o;
        for (let u = 0; u < o; u++)
          Ha(
            t,
            () => {
              let c = pe(e[u], t),
                l = !1;
              c.subscribe(
                I(
                  r,
                  (d) => {
                    (i[u] = d), l || ((l = !0), a--), a || r.next(n(i.slice()));
                  },
                  () => {
                    --s || r.complete();
                  }
                )
              );
            },
            r
          );
      },
      r
    );
  };
}
function Ha(e, t, n) {
  e ? Z(n, e, t) : t();
}
function Ua(e, t, n, r, o, i, s, a) {
  let u = [],
    c = 0,
    l = 0,
    d = !1,
    h = () => {
      d && !u.length && !c && t.complete();
    },
    f = (g) => (c < r ? p(g) : u.push(g)),
    p = (g) => {
      i && t.next(g), c++;
      let T = !1;
      N(n(g, l++)).subscribe(
        I(
          t,
          (C) => {
            o?.(C), i ? f(C) : t.next(C);
          },
          () => {
            T = !0;
          },
          void 0,
          () => {
            if (T)
              try {
                for (c--; u.length && c < r; ) {
                  let C = u.shift();
                  s ? Z(t, s, () => p(C)) : p(C);
                }
                h();
              } catch (C) {
                t.error(C);
              }
          }
        )
      );
    };
  return (
    e.subscribe(
      I(t, f, () => {
        (d = !0), h();
      })
    ),
    () => {
      a?.();
    }
  );
}
function be(e, t, n = 1 / 0) {
  return m(t)
    ? be((r, o) => Ce((i, s) => t(r, i, o, s))(N(e(r, o))), n)
    : (typeof t == 'number' && (n = t), D((r, o) => Ua(r, o, e, n)));
}
function Jt(e = 1 / 0) {
  return be(G, e);
}
function za() {
  return Jt(1);
}
function Qn(...e) {
  return za()(pe(e, he(e)));
}
function gf(e) {
  return new M((t) => {
    N(e()).subscribe(t);
  });
}
function mf(...e) {
  let t = kn(e),
    { args: n, keys: r } = Zn(e),
    o = new M((i) => {
      let { length: s } = n;
      if (!s) {
        i.complete();
        return;
      }
      let a = new Array(s),
        u = s,
        c = s;
      for (let l = 0; l < s; l++) {
        let d = !1;
        N(n[l]).subscribe(
          I(
            i,
            (h) => {
              d || ((d = !0), c--), (a[l] = h);
            },
            () => u--,
            void 0,
            () => {
              (!u || !d) && (c || i.next(r ? Yn(r, a) : a), i.complete());
            }
          )
        );
      }
    });
  return t ? o.pipe(Et(t)) : o;
}
var yf = ['addListener', 'removeListener'],
  vf = ['addEventListener', 'removeEventListener'],
  Df = ['on', 'off'];
function Ao(e, t, n, r) {
  if ((m(n) && ((r = n), (n = void 0)), r)) return Ao(e, t, n).pipe(Et(r));
  let [o, i] = wf(e)
    ? vf.map((s) => (a) => e[s](t, a, n))
    : If(e)
      ? yf.map(Ga(e, t))
      : Ef(e)
        ? Df.map(Ga(e, t))
        : [];
  if (!o && It(e)) return be((s) => Ao(s, t, n))(N(e));
  if (!o) throw new TypeError('Invalid event target');
  return new M((s) => {
    let a = (...u) => s.next(1 < u.length ? u : u[0]);
    return o(a), () => i(a);
  });
}
function Ga(e, t) {
  return (n) => (r) => e[n](t, r);
}
function If(e) {
  return m(e.addListener) && m(e.removeListener);
}
function Ef(e) {
  return m(e.on) && m(e.off);
}
function wf(e) {
  return m(e.addEventListener) && m(e.removeEventListener);
}
function Wa(e = 0, t, n = Sa) {
  let r = -1;
  return (
    t != null && (Pn(t) ? (n = t) : (r = t)),
    new M((o) => {
      let i = $a(e) ? +e - n.now() : e;
      i < 0 && (i = 0);
      let s = 0;
      return n.schedule(function () {
        o.closed ||
          (o.next(s++), 0 <= r ? this.schedule(void 0, r) : o.complete());
      }, i);
    })
  );
}
function Cf(...e) {
  let t = he(e),
    n = Ta(e, 1 / 0),
    r = e;
  return r.length ? (r.length === 1 ? N(r[0]) : Jt(n)(pe(r, t))) : Ye;
}
function Je(e, t) {
  return D((n, r) => {
    let o = 0;
    n.subscribe(I(r, (i) => e.call(t, i, o++) && r.next(i)));
  });
}
function qa(e) {
  return D((t, n) => {
    let r = !1,
      o = null,
      i = null,
      s = !1,
      a = () => {
        if ((i?.unsubscribe(), (i = null), r)) {
          r = !1;
          let c = o;
          (o = null), n.next(c);
        }
        s && n.complete();
      },
      u = () => {
        (i = null), s && n.complete();
      };
    t.subscribe(
      I(
        n,
        (c) => {
          (r = !0), (o = c), i || N(e(c)).subscribe((i = I(n, a, u)));
        },
        () => {
          (s = !0), (!r || !i || i.closed) && n.complete();
        }
      )
    );
  });
}
function bf(e, t = Kt) {
  return qa(() => Wa(e, t));
}
function Za(e) {
  return D((t, n) => {
    let r = null,
      o = !1,
      i;
    (r = t.subscribe(
      I(n, void 0, void 0, (s) => {
        (i = N(e(s, Za(e)(t)))),
          r ? (r.unsubscribe(), (r = null), i.subscribe(n)) : (o = !0);
      })
    )),
      o && (r.unsubscribe(), (r = null), i.subscribe(n));
  });
}
function Kn(e, t, n, r, o) {
  return (i, s) => {
    let a = n,
      u = t,
      c = 0;
    i.subscribe(
      I(
        s,
        (l) => {
          let d = c++;
          (u = a ? e(u, l, d) : ((a = !0), l)), r && s.next(u);
        },
        o &&
          (() => {
            a && s.next(u), s.complete();
          })
      )
    );
  };
}
function _f(e, t) {
  return D(Kn(e, t, arguments.length >= 2, !1, !0));
}
function Mf(e, t) {
  return m(t) ? be(e, t, 1) : be(e, 1);
}
function xf(e, t = Kt) {
  return D((n, r) => {
    let o = null,
      i = null,
      s = null,
      a = () => {
        if (o) {
          o.unsubscribe(), (o = null);
          let c = i;
          (i = null), r.next(c);
        }
      };
    function u() {
      let c = s + e,
        l = t.now();
      if (l < c) {
        (o = this.schedule(void 0, c - l)), r.add(o);
        return;
      }
      a();
    }
    n.subscribe(
      I(
        r,
        (c) => {
          (i = c), (s = t.now()), o || ((o = t.schedule(u, e)), r.add(o));
        },
        () => {
          a(), r.complete();
        },
        void 0,
        () => {
          i = o = null;
        }
      )
    );
  });
}
function Xt(e) {
  return D((t, n) => {
    let r = !1;
    t.subscribe(
      I(
        n,
        (o) => {
          (r = !0), n.next(o);
        },
        () => {
          r || n.next(e), n.complete();
        }
      )
    );
  });
}
function Oo(e) {
  return e <= 0
    ? () => Ye
    : D((t, n) => {
        let r = 0;
        t.subscribe(
          I(n, (o) => {
            ++r <= e && (n.next(o), e <= r && n.complete());
          })
        );
      });
}
function Sf(e) {
  return Ce(() => e);
}
function Tf(e, t = G) {
  return (
    (e = e ?? Nf),
    D((n, r) => {
      let o,
        i = !0;
      n.subscribe(
        I(r, (s) => {
          let a = t(s);
          (i || !e(o, a)) && ((i = !1), (o = a), r.next(s));
        })
      );
    })
  );
}
function Nf(e, t) {
  return e === t;
}
function Jn(e = Af) {
  return D((t, n) => {
    let r = !1;
    t.subscribe(
      I(
        n,
        (o) => {
          (r = !0), n.next(o);
        },
        () => (r ? n.complete() : n.error(e()))
      )
    );
  });
}
function Af() {
  return new Ke();
}
function Of(e) {
  return D((t, n) => {
    try {
      t.subscribe(n);
    } finally {
      n.add(e);
    }
  });
}
function Ya(e, t) {
  let n = arguments.length >= 2;
  return (r) =>
    r.pipe(
      e ? Je((o, i) => e(o, i, r)) : G,
      Oo(1),
      n ? Xt(t) : Jn(() => new Ke())
    );
}
function Fo(e) {
  return e <= 0
    ? () => Ye
    : D((t, n) => {
        let r = [];
        t.subscribe(
          I(
            n,
            (o) => {
              r.push(o), e < r.length && r.shift();
            },
            () => {
              for (let o of r) n.next(o);
              n.complete();
            },
            void 0,
            () => {
              r = null;
            }
          )
        );
      });
}
function Ff(e, t) {
  let n = arguments.length >= 2;
  return (r) =>
    r.pipe(
      e ? Je((o, i) => e(o, i, r)) : G,
      Fo(1),
      n ? Xt(t) : Jn(() => new Ke())
    );
}
function Rf(e, t) {
  return D(Kn(e, t, arguments.length >= 2, !0));
}
function Po(e = {}) {
  let {
    connector: t = () => new re(),
    resetOnError: n = !0,
    resetOnComplete: r = !0,
    resetOnRefCountZero: o = !0,
  } = e;
  return (i) => {
    let s,
      a,
      u,
      c = 0,
      l = !1,
      d = !1,
      h = () => {
        a?.unsubscribe(), (a = void 0);
      },
      f = () => {
        h(), (s = u = void 0), (l = d = !1);
      },
      p = () => {
        let g = s;
        f(), g?.unsubscribe();
      };
    return D((g, T) => {
      c++, !d && !l && h();
      let C = (u = u ?? t());
      T.add(() => {
        c--, c === 0 && !d && !l && (a = Ro(p, o));
      }),
        C.subscribe(T),
        !s &&
          c > 0 &&
          ((s = new we({
            next: (j) => C.next(j),
            error: (j) => {
              (d = !0), h(), (a = Ro(f, n, j)), C.error(j);
            },
            complete: () => {
              (l = !0), h(), (a = Ro(f, r)), C.complete();
            },
          })),
          N(g).subscribe(s));
    })(i);
  };
}
function Ro(e, t, ...n) {
  if (t === !0) {
    e();
    return;
  }
  if (t === !1) return;
  let r = new we({
    next: () => {
      r.unsubscribe(), e();
    },
  });
  return N(t(...n)).subscribe(r);
}
function Pf(e, t, n) {
  let r,
    o = !1;
  return (
    e && typeof e == 'object'
      ? ({
          bufferSize: r = 1 / 0,
          windowTime: t = 1 / 0,
          refCount: o = !1,
          scheduler: n,
        } = e)
      : (r = e ?? 1 / 0),
    Po({
      connector: () => new An(r, t, n),
      resetOnError: !0,
      resetOnComplete: !1,
      resetOnRefCountZero: o,
    })
  );
}
function kf(e) {
  return Je((t, n) => e <= n);
}
function Lf(...e) {
  let t = he(e);
  return D((n, r) => {
    (t ? Qn(e, n, t) : Qn(e, n)).subscribe(r);
  });
}
function jf(e, t) {
  return D((n, r) => {
    let o = null,
      i = 0,
      s = !1,
      a = () => s && !o && r.complete();
    n.subscribe(
      I(
        r,
        (u) => {
          o?.unsubscribe();
          let c = 0,
            l = i++;
          N(e(u, l)).subscribe(
            (o = I(
              r,
              (d) => r.next(t ? t(u, d, l, c++) : d),
              () => {
                (o = null), a();
              }
            ))
          );
        },
        () => {
          (s = !0), a();
        }
      )
    );
  });
}
function Vf(e) {
  return D((t, n) => {
    N(e).subscribe(I(n, () => n.complete(), qt)), !n.closed && t.subscribe(n);
  });
}
function Bf(e, t, n) {
  let r = m(e) || t || n ? { next: e, error: t, complete: n } : e;
  return r
    ? D((o, i) => {
        var s;
        (s = r.subscribe) === null || s === void 0 || s.call(r);
        let a = !0;
        o.subscribe(
          I(
            i,
            (u) => {
              var c;
              (c = r.next) === null || c === void 0 || c.call(r, u), i.next(u);
            },
            () => {
              var u;
              (a = !1),
                (u = r.complete) === null || u === void 0 || u.call(r),
                i.complete();
            },
            (u) => {
              var c;
              (a = !1),
                (c = r.error) === null || c === void 0 || c.call(r, u),
                i.error(u);
            },
            () => {
              var u, c;
              a && ((u = r.unsubscribe) === null || u === void 0 || u.call(r)),
                (c = r.finalize) === null || c === void 0 || c.call(r);
            }
          )
        );
      })
    : G;
}
var ku = 'https://g.co/ng/security#xss',
  S = class extends Error {
    constructor(t, n) {
      super(Lu(t, n)), (this.code = t);
    }
  };
function Lu(e, t) {
  return `${`NG0${Math.abs(e)}`}${t ? ': ' + t : ''}`;
}
function fn(e) {
  return { toString: e }.toString();
}
var Xn = '__parameters__';
function $f(e) {
  return function (...n) {
    if (e) {
      let r = e(...n);
      for (let o in r) this[o] = r[o];
    }
  };
}
function ju(e, t, n) {
  return fn(() => {
    let r = $f(t);
    function o(...i) {
      if (this instanceof o) return r.apply(this, i), this;
      let s = new o(...i);
      return (a.annotation = s), a;
      function a(u, c, l) {
        let d = u.hasOwnProperty(Xn)
          ? u[Xn]
          : Object.defineProperty(u, Xn, { value: [] })[Xn];
        for (; d.length <= l; ) d.push(null);
        return (d[l] = d[l] || []).push(s), u;
      }
    }
    return (
      n && (o.prototype = Object.create(n.prototype)),
      (o.prototype.ngMetadataName = e),
      (o.annotationCls = o),
      o
    );
  });
}
var fr = globalThis;
function O(e) {
  for (let t in e) if (e[t] === O) return t;
  throw Error('Could not find renamed property on target object.');
}
function Hf(e, t) {
  for (let n in t) t.hasOwnProperty(n) && !e.hasOwnProperty(n) && (e[n] = t[n]);
}
function J(e) {
  if (typeof e == 'string') return e;
  if (Array.isArray(e)) return '[' + e.map(J).join(', ') + ']';
  if (e == null) return '' + e;
  if (e.overriddenName) return `${e.overriddenName}`;
  if (e.name) return `${e.name}`;
  let t = e.toString();
  if (t == null) return '' + t;
  let n = t.indexOf(`
`);
  return n === -1 ? t : t.substring(0, n);
}
function Qo(e, t) {
  return e == null || e === ''
    ? t === null
      ? ''
      : t
    : t == null || t === ''
      ? e
      : e + ' ' + t;
}
var Uf = O({ __forward_ref__: O });
function Vu(e) {
  return (
    (e.__forward_ref__ = Vu),
    (e.toString = function () {
      return J(this());
    }),
    e
  );
}
function W(e) {
  return Bu(e) ? e() : e;
}
function Bu(e) {
  return (
    typeof e == 'function' && e.hasOwnProperty(Uf) && e.__forward_ref__ === Vu
  );
}
function P(e) {
  return {
    token: e.token,
    providedIn: e.providedIn || null,
    factory: e.factory,
    value: void 0,
  };
}
function $u(e) {
  return { providers: e.providers || [], imports: e.imports || [] };
}
function Hr(e) {
  return Qa(e, Hu) || Qa(e, Uu);
}
function BM(e) {
  return Hr(e) !== null;
}
function Qa(e, t) {
  return e.hasOwnProperty(t) ? e[t] : null;
}
function zf(e) {
  let t = e && (e[Hu] || e[Uu]);
  return t || null;
}
function Ka(e) {
  return e && (e.hasOwnProperty(Ja) || e.hasOwnProperty(Gf)) ? e[Ja] : null;
}
var Hu = O({ ɵprov: O }),
  Ja = O({ ɵinj: O }),
  Uu = O({ ngInjectableDef: O }),
  Gf = O({ ngInjectorDef: O }),
  A = class {
    constructor(t, n) {
      (this._desc = t),
        (this.ngMetadataName = 'InjectionToken'),
        (this.ɵprov = void 0),
        typeof n == 'number'
          ? (this.__NG_ELEMENT_ID__ = n)
          : n !== void 0 &&
            (this.ɵprov = P({
              token: this,
              providedIn: n.providedIn || 'root',
              factory: n.factory,
            }));
    }
    get multi() {
      return this;
    }
    toString() {
      return `InjectionToken ${this._desc}`;
    }
  };
function zu(e) {
  return e && !!e.ɵproviders;
}
var Wf = O({ ɵcmp: O }),
  qf = O({ ɵdir: O }),
  Zf = O({ ɵpipe: O }),
  Yf = O({ ɵmod: O }),
  hr = O({ ɵfac: O }),
  tn = O({ __NG_ELEMENT_ID__: O }),
  Xa = O({ __NG_ENV_ID__: O });
function xt(e) {
  return typeof e == 'string' ? e : e == null ? '' : String(e);
}
function Qf(e) {
  return typeof e == 'function'
    ? e.name || e.toString()
    : typeof e == 'object' && e != null && typeof e.type == 'function'
      ? e.type.name || e.type.toString()
      : xt(e);
}
function Kf(e, t) {
  let n = t ? `. Dependency path: ${t.join(' > ')} > ${e}` : '';
  throw new S(-200, e);
}
function is(e, t) {
  throw new S(-201, !1);
}
var _ = (function (e) {
    return (
      (e[(e.Default = 0)] = 'Default'),
      (e[(e.Host = 1)] = 'Host'),
      (e[(e.Self = 2)] = 'Self'),
      (e[(e.SkipSelf = 4)] = 'SkipSelf'),
      (e[(e.Optional = 8)] = 'Optional'),
      e
    );
  })(_ || {}),
  Ko;
function Gu() {
  return Ko;
}
function Y(e) {
  let t = Ko;
  return (Ko = e), t;
}
function Wu(e, t, n) {
  let r = Hr(e);
  if (r && r.providedIn == 'root')
    return r.value === void 0 ? (r.value = r.factory()) : r.value;
  if (n & _.Optional) return null;
  if (t !== void 0) return t;
  is(e, 'Injector');
}
var Jf = {},
  nn = Jf,
  Jo = '__NG_DI_FLAG__',
  pr = 'ngTempTokenPath',
  Xf = 'ngTokenPath',
  eh = /\n/gm,
  th = '\u0275',
  eu = '__source',
  _t;
function nh() {
  return _t;
}
function Re(e) {
  let t = _t;
  return (_t = e), t;
}
function rh(e, t = _.Default) {
  if (_t === void 0) throw new S(-203, !1);
  return _t === null
    ? Wu(e, void 0, t)
    : _t.get(e, t & _.Optional ? null : void 0, t);
}
function U(e, t = _.Default) {
  return (Gu() || rh)(W(e), t);
}
function x(e, t = _.Default) {
  return U(e, Ur(t));
}
function Ur(e) {
  return typeof e > 'u' || typeof e == 'number'
    ? e
    : 0 | (e.optional && 8) | (e.host && 1) | (e.self && 2) | (e.skipSelf && 4);
}
function Xo(e) {
  let t = [];
  for (let n = 0; n < e.length; n++) {
    let r = W(e[n]);
    if (Array.isArray(r)) {
      if (r.length === 0) throw new S(900, !1);
      let o,
        i = _.Default;
      for (let s = 0; s < r.length; s++) {
        let a = r[s],
          u = oh(a);
        typeof u == 'number' ? (u === -1 ? (o = a.token) : (i |= u)) : (o = a);
      }
      t.push(U(o, i));
    } else t.push(U(r));
  }
  return t;
}
function qu(e, t) {
  return (e[Jo] = t), (e.prototype[Jo] = t), e;
}
function oh(e) {
  return e[Jo];
}
function ih(e, t, n, r) {
  let o = e[pr];
  throw (
    (t[eu] && o.unshift(t[eu]),
    (e.message = sh(
      `
` + e.message,
      o,
      n,
      r
    )),
    (e[Xf] = o),
    (e[pr] = null),
    e)
  );
}
function sh(e, t, n, r = null) {
  e =
    e &&
    e.charAt(0) ===
      `
` &&
    e.charAt(1) == th
      ? e.slice(2)
      : e;
  let o = J(t);
  if (Array.isArray(t)) o = t.map(J).join(' -> ');
  else if (typeof t == 'object') {
    let i = [];
    for (let s in t)
      if (t.hasOwnProperty(s)) {
        let a = t[s];
        i.push(s + ':' + (typeof a == 'string' ? JSON.stringify(a) : J(a)));
      }
    o = `{${i.join(', ')}}`;
  }
  return `${n}${r ? '(' + r + ')' : ''}[${o}]: ${e.replace(
    eh,
    `
  `
  )}`;
}
var ah = qu(ju('Optional'), 8);
var uh = qu(ju('SkipSelf'), 4);
function tt(e, t) {
  let n = e.hasOwnProperty(hr);
  return n ? e[hr] : null;
}
function ch(e, t, n) {
  if (e.length !== t.length) return !1;
  for (let r = 0; r < e.length; r++) {
    let o = e[r],
      i = t[r];
    if ((n && ((o = n(o)), (i = n(i))), i !== o)) return !1;
  }
  return !0;
}
function lh(e) {
  return e.flat(Number.POSITIVE_INFINITY);
}
function ss(e, t) {
  e.forEach((n) => (Array.isArray(n) ? ss(n, t) : t(n)));
}
function Zu(e, t, n) {
  t >= e.length ? e.push(n) : e.splice(t, 0, n);
}
function gr(e, t) {
  return t >= e.length - 1 ? e.pop() : e.splice(t, 1)[0];
}
function dh(e, t) {
  let n = [];
  for (let r = 0; r < e; r++) n.push(t);
  return n;
}
function fh(e, t, n, r) {
  let o = e.length;
  if (o == t) e.push(n, r);
  else if (o === 1) e.push(r, e[0]), (e[0] = n);
  else {
    for (o--, e.push(e[o - 1], e[o]); o > t; ) {
      let i = o - 2;
      (e[o] = e[i]), o--;
    }
    (e[t] = n), (e[t + 1] = r);
  }
}
function as(e, t, n) {
  let r = hn(e, t);
  return r >= 0 ? (e[r | 1] = n) : ((r = ~r), fh(e, r, t, n)), r;
}
function ko(e, t) {
  let n = hn(e, t);
  if (n >= 0) return e[n | 1];
}
function hn(e, t) {
  return hh(e, t, 1);
}
function hh(e, t, n) {
  let r = 0,
    o = e.length >> n;
  for (; o !== r; ) {
    let i = r + ((o - r) >> 1),
      s = e[i << n];
    if (t === s) return i << n;
    s > t ? (o = i) : (r = i + 1);
  }
  return ~(o << n);
}
var St = {},
  Q = [],
  mr = new A(''),
  Yu = new A('', -1),
  Qu = new A(''),
  yr = class {
    get(t, n = nn) {
      if (n === nn) {
        let r = new Error(`NullInjectorError: No provider for ${J(t)}!`);
        throw ((r.name = 'NullInjectorError'), r);
      }
      return n;
    }
  },
  Ku = (function (e) {
    return (e[(e.OnPush = 0)] = 'OnPush'), (e[(e.Default = 1)] = 'Default'), e;
  })(Ku || {}),
  rn = (function (e) {
    return (
      (e[(e.Emulated = 0)] = 'Emulated'),
      (e[(e.None = 2)] = 'None'),
      (e[(e.ShadowDom = 3)] = 'ShadowDom'),
      e
    );
  })(rn || {}),
  Le = (function (e) {
    return (
      (e[(e.None = 0)] = 'None'),
      (e[(e.SignalBased = 1)] = 'SignalBased'),
      (e[(e.HasDecoratorInputTransform = 2)] = 'HasDecoratorInputTransform'),
      e
    );
  })(Le || {});
function ph(e, t, n) {
  let r = e.length;
  for (;;) {
    let o = e.indexOf(t, n);
    if (o === -1) return o;
    if (o === 0 || e.charCodeAt(o - 1) <= 32) {
      let i = t.length;
      if (o + i === r || e.charCodeAt(o + i) <= 32) return o;
    }
    n = o + 1;
  }
}
function ei(e, t, n) {
  let r = 0;
  for (; r < n.length; ) {
    let o = n[r];
    if (typeof o == 'number') {
      if (o !== 0) break;
      r++;
      let i = n[r++],
        s = n[r++],
        a = n[r++];
      e.setAttribute(t, s, a, i);
    } else {
      let i = o,
        s = n[++r];
      gh(i) ? e.setProperty(t, i, s) : e.setAttribute(t, i, s), r++;
    }
  }
  return r;
}
function Ju(e) {
  return e === 3 || e === 4 || e === 6;
}
function gh(e) {
  return e.charCodeAt(0) === 64;
}
function on(e, t) {
  if (!(t === null || t.length === 0))
    if (e === null || e.length === 0) e = t.slice();
    else {
      let n = -1;
      for (let r = 0; r < t.length; r++) {
        let o = t[r];
        typeof o == 'number'
          ? (n = o)
          : n === 0 ||
            (n === -1 || n === 2
              ? tu(e, n, o, null, t[++r])
              : tu(e, n, o, null, null));
      }
    }
  return e;
}
function tu(e, t, n, r, o) {
  let i = 0,
    s = e.length;
  if (t === -1) s = -1;
  else
    for (; i < e.length; ) {
      let a = e[i++];
      if (typeof a == 'number') {
        if (a === t) {
          s = -1;
          break;
        } else if (a > t) {
          s = i - 1;
          break;
        }
      }
    }
  for (; i < e.length; ) {
    let a = e[i];
    if (typeof a == 'number') break;
    if (a === n) {
      if (r === null) {
        o !== null && (e[i + 1] = o);
        return;
      } else if (r === e[i + 1]) {
        e[i + 2] = o;
        return;
      }
    }
    i++, r !== null && i++, o !== null && i++;
  }
  s !== -1 && (e.splice(s, 0, t), (i = s + 1)),
    e.splice(i++, 0, n),
    r !== null && e.splice(i++, 0, r),
    o !== null && e.splice(i++, 0, o);
}
var Xu = 'ng-template';
function mh(e, t, n, r) {
  let o = 0;
  if (r) {
    for (; o < t.length && typeof t[o] == 'string'; o += 2)
      if (t[o] === 'class' && ph(t[o + 1].toLowerCase(), n, 0) !== -1)
        return !0;
  } else if (us(e)) return !1;
  if (((o = t.indexOf(1, o)), o > -1)) {
    let i;
    for (; ++o < t.length && typeof (i = t[o]) == 'string'; )
      if (i.toLowerCase() === n) return !0;
  }
  return !1;
}
function us(e) {
  return e.type === 4 && e.value !== Xu;
}
function yh(e, t, n) {
  let r = e.type === 4 && !n ? Xu : e.value;
  return t === r;
}
function vh(e, t, n) {
  let r = 4,
    o = e.attrs,
    i = o !== null ? Eh(o) : 0,
    s = !1;
  for (let a = 0; a < t.length; a++) {
    let u = t[a];
    if (typeof u == 'number') {
      if (!s && !ce(r) && !ce(u)) return !1;
      if (s && ce(u)) continue;
      (s = !1), (r = u | (r & 1));
      continue;
    }
    if (!s)
      if (r & 4) {
        if (
          ((r = 2 | (r & 1)),
          (u !== '' && !yh(e, u, n)) || (u === '' && t.length === 1))
        ) {
          if (ce(r)) return !1;
          s = !0;
        }
      } else if (r & 8) {
        if (o === null || !mh(e, o, u, n)) {
          if (ce(r)) return !1;
          s = !0;
        }
      } else {
        let c = t[++a],
          l = Dh(u, o, us(e), n);
        if (l === -1) {
          if (ce(r)) return !1;
          s = !0;
          continue;
        }
        if (c !== '') {
          let d;
          if (
            (l > i ? (d = '') : (d = o[l + 1].toLowerCase()), r & 2 && c !== d)
          ) {
            if (ce(r)) return !1;
            s = !0;
          }
        }
      }
  }
  return ce(r) || s;
}
function ce(e) {
  return (e & 1) === 0;
}
function Dh(e, t, n, r) {
  if (t === null) return -1;
  let o = 0;
  if (r || !n) {
    let i = !1;
    for (; o < t.length; ) {
      let s = t[o];
      if (s === e) return o;
      if (s === 3 || s === 6) i = !0;
      else if (s === 1 || s === 2) {
        let a = t[++o];
        for (; typeof a == 'string'; ) a = t[++o];
        continue;
      } else {
        if (s === 4) break;
        if (s === 0) {
          o += 4;
          continue;
        }
      }
      o += i ? 1 : 2;
    }
    return -1;
  } else return wh(t, e);
}
function ec(e, t, n = !1) {
  for (let r = 0; r < t.length; r++) if (vh(e, t[r], n)) return !0;
  return !1;
}
function Ih(e) {
  let t = e.attrs;
  if (t != null) {
    let n = t.indexOf(5);
    if (!(n & 1)) return t[n + 1];
  }
  return null;
}
function Eh(e) {
  for (let t = 0; t < e.length; t++) {
    let n = e[t];
    if (Ju(n)) return t;
  }
  return e.length;
}
function wh(e, t) {
  let n = e.indexOf(4);
  if (n > -1)
    for (n++; n < e.length; ) {
      let r = e[n];
      if (typeof r == 'number') return -1;
      if (r === t) return n;
      n++;
    }
  return -1;
}
function Ch(e, t) {
  e: for (let n = 0; n < t.length; n++) {
    let r = t[n];
    if (e.length === r.length) {
      for (let o = 0; o < e.length; o++) if (e[o] !== r[o]) continue e;
      return !0;
    }
  }
  return !1;
}
function nu(e, t) {
  return e ? ':not(' + t.trim() + ')' : t;
}
function bh(e) {
  let t = e[0],
    n = 1,
    r = 2,
    o = '',
    i = !1;
  for (; n < e.length; ) {
    let s = e[n];
    if (typeof s == 'string')
      if (r & 2) {
        let a = e[++n];
        o += '[' + s + (a.length > 0 ? '="' + a + '"' : '') + ']';
      } else r & 8 ? (o += '.' + s) : r & 4 && (o += ' ' + s);
    else
      o !== '' && !ce(s) && ((t += nu(i, o)), (o = '')),
        (r = s),
        (i = i || !ce(r));
    n++;
  }
  return o !== '' && (t += nu(i, o)), t;
}
function _h(e) {
  return e.map(bh).join(',');
}
function Mh(e) {
  let t = [],
    n = [],
    r = 1,
    o = 2;
  for (; r < e.length; ) {
    let i = e[r];
    if (typeof i == 'string')
      o === 2 ? i !== '' && t.push(i, e[++r]) : o === 8 && n.push(i);
    else {
      if (!ce(o)) break;
      o = i;
    }
    r++;
  }
  return { attrs: t, classes: n };
}
function $M(e) {
  return fn(() => {
    let t = sc(e),
      n = Fe(Oe({}, t), {
        decls: e.decls,
        vars: e.vars,
        template: e.template,
        consts: e.consts || null,
        ngContentSelectors: e.ngContentSelectors,
        onPush: e.changeDetection === Ku.OnPush,
        directiveDefs: null,
        pipeDefs: null,
        dependencies: (t.standalone && e.dependencies) || null,
        getStandaloneInjector: null,
        signals: e.signals ?? !1,
        data: e.data || {},
        encapsulation: e.encapsulation || rn.Emulated,
        styles: e.styles || Q,
        _: null,
        schemas: e.schemas || null,
        tView: null,
        id: '',
      });
    ac(n);
    let r = e.dependencies;
    return (
      (n.directiveDefs = ou(r, !1)), (n.pipeDefs = ou(r, !0)), (n.id = Ah(n)), n
    );
  });
}
function xh(e) {
  return je(e) || rc(e);
}
function Sh(e) {
  return e !== null;
}
function tc(e) {
  return fn(() => ({
    type: e.type,
    bootstrap: e.bootstrap || Q,
    declarations: e.declarations || Q,
    imports: e.imports || Q,
    exports: e.exports || Q,
    transitiveCompileScopes: null,
    schemas: e.schemas || null,
    id: e.id || null,
  }));
}
function ru(e, t) {
  if (e == null) return St;
  let n = {};
  for (let r in e)
    if (e.hasOwnProperty(r)) {
      let o = e[r],
        i,
        s,
        a = Le.None;
      Array.isArray(o)
        ? ((a = o[0]), (i = o[1]), (s = o[2] ?? i))
        : ((i = o), (s = o)),
        t ? ((n[i] = a !== Le.None ? [r, a] : r), (t[i] = s)) : (n[i] = r);
    }
  return n;
}
function Th(e) {
  return fn(() => {
    let t = sc(e);
    return ac(t), t;
  });
}
function nc(e) {
  return {
    type: e.type,
    name: e.name,
    factory: null,
    pure: e.pure !== !1,
    standalone: e.standalone === !0,
    onDestroy: e.type.prototype.ngOnDestroy || null,
  };
}
function je(e) {
  return e[Wf] || null;
}
function rc(e) {
  return e[qf] || null;
}
function oc(e) {
  return e[Zf] || null;
}
function Nh(e) {
  let t = je(e) || rc(e) || oc(e);
  return t !== null ? t.standalone : !1;
}
function ic(e, t) {
  let n = e[Yf] || null;
  if (!n && t === !0)
    throw new Error(`Type ${J(e)} does not have '\u0275mod' property.`);
  return n;
}
function sc(e) {
  let t = {};
  return {
    type: e.type,
    providersResolver: null,
    factory: null,
    hostBindings: e.hostBindings || null,
    hostVars: e.hostVars || 0,
    hostAttrs: e.hostAttrs || null,
    contentQueries: e.contentQueries || null,
    declaredInputs: t,
    inputTransforms: null,
    inputConfig: e.inputs || St,
    exportAs: e.exportAs || null,
    standalone: e.standalone === !0,
    signals: e.signals === !0,
    selectors: e.selectors || Q,
    viewQuery: e.viewQuery || null,
    features: e.features || null,
    setInput: null,
    findHostDirectiveDefs: null,
    hostDirectives: null,
    inputs: ru(e.inputs, t),
    outputs: ru(e.outputs),
    debugInfo: null,
  };
}
function ac(e) {
  e.features?.forEach((t) => t(e));
}
function ou(e, t) {
  if (!e) return null;
  let n = t ? oc : xh;
  return () => (typeof e == 'function' ? e() : e).map((r) => n(r)).filter(Sh);
}
function Ah(e) {
  let t = 0,
    n = [
      e.selectors,
      e.ngContentSelectors,
      e.hostVars,
      e.hostAttrs,
      e.consts,
      e.vars,
      e.decls,
      e.encapsulation,
      e.standalone,
      e.signals,
      e.exportAs,
      JSON.stringify(e.inputs),
      JSON.stringify(e.outputs),
      Object.getOwnPropertyNames(e.type.prototype),
      !!e.contentQueries,
      !!e.viewQuery,
    ].join('|');
  for (let o of n) t = (Math.imul(31, t) + o.charCodeAt(0)) << 0;
  return (t += 2147483648), 'c' + t;
}
function Oh(e) {
  return { ɵproviders: e };
}
function Fh(...e) {
  return { ɵproviders: uc(!0, e), ɵfromNgModule: !0 };
}
function uc(e, ...t) {
  let n = [],
    r = new Set(),
    o,
    i = (s) => {
      n.push(s);
    };
  return (
    ss(t, (s) => {
      let a = s;
      ti(a, i, [], r) && ((o ||= []), o.push(a));
    }),
    o !== void 0 && cc(o, i),
    n
  );
}
function cc(e, t) {
  for (let n = 0; n < e.length; n++) {
    let { ngModule: r, providers: o } = e[n];
    cs(o, (i) => {
      t(i, r);
    });
  }
}
function ti(e, t, n, r) {
  if (((e = W(e)), !e)) return !1;
  let o = null,
    i = Ka(e),
    s = !i && je(e);
  if (!i && !s) {
    let u = e.ngModule;
    if (((i = Ka(u)), i)) o = u;
    else return !1;
  } else {
    if (s && !s.standalone) return !1;
    o = e;
  }
  let a = r.has(o);
  if (s) {
    if (a) return !1;
    if ((r.add(o), s.dependencies)) {
      let u =
        typeof s.dependencies == 'function' ? s.dependencies() : s.dependencies;
      for (let c of u) ti(c, t, n, r);
    }
  } else if (i) {
    if (i.imports != null && !a) {
      r.add(o);
      let c;
      try {
        ss(i.imports, (l) => {
          ti(l, t, n, r) && ((c ||= []), c.push(l));
        });
      } finally {
      }
      c !== void 0 && cc(c, t);
    }
    if (!a) {
      let c = tt(o) || (() => new o());
      t({ provide: o, useFactory: c, deps: Q }, o),
        t({ provide: Qu, useValue: o, multi: !0 }, o),
        t({ provide: mr, useValue: () => U(o), multi: !0 }, o);
    }
    let u = i.providers;
    if (u != null && !a) {
      let c = e;
      cs(u, (l) => {
        t(l, c);
      });
    }
  } else return !1;
  return o !== e && e.providers !== void 0;
}
function cs(e, t) {
  for (let n of e)
    zu(n) && (n = n.ɵproviders), Array.isArray(n) ? cs(n, t) : t(n);
}
var Rh = O({ provide: String, useValue: O });
function lc(e) {
  return e !== null && typeof e == 'object' && Rh in e;
}
function Ph(e) {
  return !!(e && e.useExisting);
}
function kh(e) {
  return !!(e && e.useFactory);
}
function Tt(e) {
  return typeof e == 'function';
}
function Lh(e) {
  return !!e.useClass;
}
var dc = new A(''),
  sr = {},
  jh = {},
  Lo;
function ls() {
  return Lo === void 0 && (Lo = new yr()), Lo;
}
var Ve = class {},
  sn = class extends Ve {
    get destroyed() {
      return this._destroyed;
    }
    constructor(t, n, r, o) {
      super(),
        (this.parent = n),
        (this.source = r),
        (this.scopes = o),
        (this.records = new Map()),
        (this._ngOnDestroyHooks = new Set()),
        (this._onDestroyHooks = []),
        (this._destroyed = !1),
        ri(t, (s) => this.processProvider(s)),
        this.records.set(Yu, wt(void 0, this)),
        o.has('environment') && this.records.set(Ve, wt(void 0, this));
      let i = this.records.get(dc);
      i != null && typeof i.value == 'string' && this.scopes.add(i.value),
        (this.injectorDefTypes = new Set(this.get(Qu, Q, _.Self)));
    }
    destroy() {
      this.assertNotDestroyed(), (this._destroyed = !0);
      let t = b(null);
      try {
        for (let r of this._ngOnDestroyHooks) r.ngOnDestroy();
        let n = this._onDestroyHooks;
        this._onDestroyHooks = [];
        for (let r of n) r();
      } finally {
        this.records.clear(),
          this._ngOnDestroyHooks.clear(),
          this.injectorDefTypes.clear(),
          b(t);
      }
    }
    onDestroy(t) {
      return (
        this.assertNotDestroyed(),
        this._onDestroyHooks.push(t),
        () => this.removeOnDestroy(t)
      );
    }
    runInContext(t) {
      this.assertNotDestroyed();
      let n = Re(this),
        r = Y(void 0),
        o;
      try {
        return t();
      } finally {
        Re(n), Y(r);
      }
    }
    get(t, n = nn, r = _.Default) {
      if ((this.assertNotDestroyed(), t.hasOwnProperty(Xa))) return t[Xa](this);
      r = Ur(r);
      let o,
        i = Re(this),
        s = Y(void 0);
      try {
        if (!(r & _.SkipSelf)) {
          let u = this.records.get(t);
          if (u === void 0) {
            let c = Uh(t) && Hr(t);
            c && this.injectableDefInScope(c)
              ? (u = wt(ni(t), sr))
              : (u = null),
              this.records.set(t, u);
          }
          if (u != null) return this.hydrate(t, u);
        }
        let a = r & _.Self ? ls() : this.parent;
        return (n = r & _.Optional && n === nn ? null : n), a.get(t, n);
      } catch (a) {
        if (a.name === 'NullInjectorError') {
          if (((a[pr] = a[pr] || []).unshift(J(t)), i)) throw a;
          return ih(a, t, 'R3InjectorError', this.source);
        } else throw a;
      } finally {
        Y(s), Re(i);
      }
    }
    resolveInjectorInitializers() {
      let t = b(null),
        n = Re(this),
        r = Y(void 0),
        o;
      try {
        let i = this.get(mr, Q, _.Self);
        for (let s of i) s();
      } finally {
        Re(n), Y(r), b(t);
      }
    }
    toString() {
      let t = [],
        n = this.records;
      for (let r of n.keys()) t.push(J(r));
      return `R3Injector[${t.join(', ')}]`;
    }
    assertNotDestroyed() {
      if (this._destroyed) throw new S(205, !1);
    }
    processProvider(t) {
      t = W(t);
      let n = Tt(t) ? t : W(t && t.provide),
        r = Bh(t);
      if (!Tt(t) && t.multi === !0) {
        let o = this.records.get(n);
        o ||
          ((o = wt(void 0, sr, !0)),
          (o.factory = () => Xo(o.multi)),
          this.records.set(n, o)),
          (n = t),
          o.multi.push(t);
      }
      this.records.set(n, r);
    }
    hydrate(t, n) {
      let r = b(null);
      try {
        return (
          n.value === sr && ((n.value = jh), (n.value = n.factory())),
          typeof n.value == 'object' &&
            n.value &&
            Hh(n.value) &&
            this._ngOnDestroyHooks.add(n.value),
          n.value
        );
      } finally {
        b(r);
      }
    }
    injectableDefInScope(t) {
      if (!t.providedIn) return !1;
      let n = W(t.providedIn);
      return typeof n == 'string'
        ? n === 'any' || this.scopes.has(n)
        : this.injectorDefTypes.has(n);
    }
    removeOnDestroy(t) {
      let n = this._onDestroyHooks.indexOf(t);
      n !== -1 && this._onDestroyHooks.splice(n, 1);
    }
  };
function ni(e) {
  let t = Hr(e),
    n = t !== null ? t.factory : tt(e);
  if (n !== null) return n;
  if (e instanceof A) throw new S(204, !1);
  if (e instanceof Function) return Vh(e);
  throw new S(204, !1);
}
function Vh(e) {
  if (e.length > 0) throw new S(204, !1);
  let n = zf(e);
  return n !== null ? () => n.factory(e) : () => new e();
}
function Bh(e) {
  if (lc(e)) return wt(void 0, e.useValue);
  {
    let t = fc(e);
    return wt(t, sr);
  }
}
function fc(e, t, n) {
  let r;
  if (Tt(e)) {
    let o = W(e);
    return tt(o) || ni(o);
  } else if (lc(e)) r = () => W(e.useValue);
  else if (kh(e)) r = () => e.useFactory(...Xo(e.deps || []));
  else if (Ph(e)) r = () => U(W(e.useExisting));
  else {
    let o = W(e && (e.useClass || e.provide));
    if ($h(e)) r = () => new o(...Xo(e.deps));
    else return tt(o) || ni(o);
  }
  return r;
}
function wt(e, t, n = !1) {
  return { factory: e, value: t, multi: n ? [] : void 0 };
}
function $h(e) {
  return !!e.deps;
}
function Hh(e) {
  return (
    e !== null && typeof e == 'object' && typeof e.ngOnDestroy == 'function'
  );
}
function Uh(e) {
  return typeof e == 'function' || (typeof e == 'object' && e instanceof A);
}
function ri(e, t) {
  for (let n of e)
    Array.isArray(n) ? ri(n, t) : n && zu(n) ? ri(n.ɵproviders, t) : t(n);
}
function zh(e, t) {
  e instanceof sn && e.assertNotDestroyed();
  let n,
    r = Re(e),
    o = Y(void 0);
  try {
    return t();
  } finally {
    Re(r), Y(o);
  }
}
function hc() {
  return Gu() !== void 0 || nh() != null;
}
function Gh(e) {
  if (!hc()) throw new S(-203, !1);
}
function Wh(e) {
  return typeof e == 'function';
}
var De = 0,
  v = 1,
  y = 2,
  z = 3,
  fe = 4,
  ee = 5,
  Nt = 6,
  vr = 7,
  $ = 8,
  At = 9,
  ye = 10,
  R = 11,
  an = 12,
  iu = 13,
  Bt = 14,
  te = 15,
  nt = 16,
  Ct = 17,
  _e = 18,
  zr = 19,
  pc = 20,
  Pe = 21,
  jo = 22,
  oe = 23,
  B = 25,
  ds = 1;
var rt = 7,
  Dr = 8,
  Ot = 9,
  H = 10,
  Ir = (function (e) {
    return (
      (e[(e.None = 0)] = 'None'),
      (e[(e.HasTransplantedViews = 2)] = 'HasTransplantedViews'),
      e
    );
  })(Ir || {});
function ke(e) {
  return Array.isArray(e) && typeof e[ds] == 'object';
}
function Se(e) {
  return Array.isArray(e) && e[ds] === !0;
}
function fs(e) {
  return (e.flags & 4) !== 0;
}
function Gr(e) {
  return e.componentOffset > -1;
}
function Wr(e) {
  return (e.flags & 1) === 1;
}
function Me(e) {
  return !!e.template;
}
function oi(e) {
  return (e[y] & 512) !== 0;
}
var ii = class {
  constructor(t, n, r) {
    (this.previousValue = t), (this.currentValue = n), (this.firstChange = r);
  }
  isFirstChange() {
    return this.firstChange;
  }
};
function gc(e, t, n, r) {
  t !== null ? t.applyValueToInputSignal(t, r) : (e[n] = r);
}
function mc() {
  return yc;
}
function yc(e) {
  return e.type.prototype.ngOnChanges && (e.setInput = Zh), qh;
}
mc.ngInherit = !0;
function qh() {
  let e = Dc(this),
    t = e?.current;
  if (t) {
    let n = e.previous;
    if (n === St) e.previous = t;
    else for (let r in t) n[r] = t[r];
    (e.current = null), this.ngOnChanges(t);
  }
}
function Zh(e, t, n, r, o) {
  let i = this.declaredInputs[r],
    s = Dc(e) || Yh(e, { previous: St, current: null }),
    a = s.current || (s.current = {}),
    u = s.previous,
    c = u[i];
  (a[i] = new ii(c && c.currentValue, n, u === St)), gc(e, t, o, n);
}
var vc = '__ngSimpleChanges__';
function Dc(e) {
  return e[vc] || null;
}
function Yh(e, t) {
  return (e[vc] = t);
}
var su = null;
var ge = function (e, t, n) {
    su?.(e, t, n);
  },
  Ic = 'svg',
  Qh = 'math';
function ve(e) {
  for (; Array.isArray(e); ) e = e[De];
  return e;
}
function Kh(e) {
  for (; Array.isArray(e); ) {
    if (typeof e[ds] == 'object') return e;
    e = e[De];
  }
  return null;
}
function Ec(e, t) {
  return ve(t[e]);
}
function ie(e, t) {
  return ve(t[e.index]);
}
function hs(e, t) {
  return e.data[t];
}
function wc(e, t) {
  return e[t];
}
function Ue(e, t) {
  let n = t[e];
  return ke(n) ? n : n[De];
}
function Jh(e) {
  return (e[y] & 4) === 4;
}
function ps(e) {
  return (e[y] & 128) === 128;
}
function Xh(e) {
  return Se(e[z]);
}
function Be(e, t) {
  return t == null ? null : e[t];
}
function Cc(e) {
  e[Ct] = 0;
}
function bc(e) {
  e[y] & 1024 || ((e[y] |= 1024), ps(e) && qr(e));
}
function ep(e, t) {
  for (; e > 0; ) (t = t[Bt]), e--;
  return t;
}
function un(e) {
  return !!(e[y] & 9216 || e[oe]?.dirty);
}
function si(e) {
  e[ye].changeDetectionScheduler?.notify(7),
    e[y] & 64 && (e[y] |= 1024),
    un(e) && qr(e);
}
function qr(e) {
  e[ye].changeDetectionScheduler?.notify(0);
  let t = ot(e);
  for (; t !== null && !(t[y] & 8192 || ((t[y] |= 8192), !ps(t))); ) t = ot(t);
}
function _c(e, t) {
  if ((e[y] & 256) === 256) throw new S(911, !1);
  e[Pe] === null && (e[Pe] = []), e[Pe].push(t);
}
function tp(e, t) {
  if (e[Pe] === null) return;
  let n = e[Pe].indexOf(t);
  n !== -1 && e[Pe].splice(n, 1);
}
function ot(e) {
  let t = e[z];
  return Se(t) ? t[z] : t;
}
var w = { lFrame: Rc(null), bindingsEnabled: !0, skipHydrationRootTNode: null };
var Mc = !1;
function np() {
  return w.lFrame.elementDepthCount;
}
function rp() {
  w.lFrame.elementDepthCount++;
}
function op() {
  w.lFrame.elementDepthCount--;
}
function xc() {
  return w.bindingsEnabled;
}
function Sc() {
  return w.skipHydrationRootTNode !== null;
}
function ip(e) {
  return w.skipHydrationRootTNode === e;
}
function sp() {
  w.skipHydrationRootTNode = null;
}
function E() {
  return w.lFrame.lView;
}
function F() {
  return w.lFrame.tView;
}
function HM(e) {
  return (w.lFrame.contextLView = e), e[$];
}
function UM(e) {
  return (w.lFrame.contextLView = null), e;
}
function V() {
  let e = Tc();
  for (; e !== null && e.type === 64; ) e = e.parent;
  return e;
}
function Tc() {
  return w.lFrame.currentTNode;
}
function ap() {
  let e = w.lFrame,
    t = e.currentTNode;
  return e.isParent ? t : t.parent;
}
function dt(e, t) {
  let n = w.lFrame;
  (n.currentTNode = e), (n.isParent = t);
}
function gs() {
  return w.lFrame.isParent;
}
function ms() {
  w.lFrame.isParent = !1;
}
function up() {
  return w.lFrame.contextLView;
}
function Nc() {
  return Mc;
}
function au(e) {
  Mc = e;
}
function cp() {
  let e = w.lFrame,
    t = e.bindingRootIndex;
  return t === -1 && (t = e.bindingRootIndex = e.tView.bindingStartIndex), t;
}
function lp() {
  return w.lFrame.bindingIndex;
}
function dp(e) {
  return (w.lFrame.bindingIndex = e);
}
function ze() {
  return w.lFrame.bindingIndex++;
}
function ys(e) {
  let t = w.lFrame,
    n = t.bindingIndex;
  return (t.bindingIndex = t.bindingIndex + e), n;
}
function fp() {
  return w.lFrame.inI18n;
}
function hp(e, t) {
  let n = w.lFrame;
  (n.bindingIndex = n.bindingRootIndex = e), ai(t);
}
function pp() {
  return w.lFrame.currentDirectiveIndex;
}
function ai(e) {
  w.lFrame.currentDirectiveIndex = e;
}
function vs(e) {
  let t = w.lFrame.currentDirectiveIndex;
  return t === -1 ? null : e[t];
}
function Ac() {
  return w.lFrame.currentQueryIndex;
}
function Ds(e) {
  w.lFrame.currentQueryIndex = e;
}
function gp(e) {
  let t = e[v];
  return t.type === 2 ? t.declTNode : t.type === 1 ? e[ee] : null;
}
function Oc(e, t, n) {
  if (n & _.SkipSelf) {
    let o = t,
      i = e;
    for (; (o = o.parent), o === null && !(n & _.Host); )
      if (((o = gp(i)), o === null || ((i = i[Bt]), o.type & 10))) break;
    if (o === null) return !1;
    (t = o), (e = i);
  }
  let r = (w.lFrame = Fc());
  return (r.currentTNode = t), (r.lView = e), !0;
}
function Is(e) {
  let t = Fc(),
    n = e[v];
  (w.lFrame = t),
    (t.currentTNode = n.firstChild),
    (t.lView = e),
    (t.tView = n),
    (t.contextLView = e),
    (t.bindingIndex = n.bindingStartIndex),
    (t.inI18n = !1);
}
function Fc() {
  let e = w.lFrame,
    t = e === null ? null : e.child;
  return t === null ? Rc(e) : t;
}
function Rc(e) {
  let t = {
    currentTNode: null,
    isParent: !0,
    lView: null,
    tView: null,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent: e,
    child: null,
    inI18n: !1,
  };
  return e !== null && (e.child = t), t;
}
function Pc() {
  let e = w.lFrame;
  return (w.lFrame = e.parent), (e.currentTNode = null), (e.lView = null), e;
}
var kc = Pc;
function Es() {
  let e = Pc();
  (e.isParent = !0),
    (e.tView = null),
    (e.selectedIndex = -1),
    (e.contextLView = null),
    (e.elementDepthCount = 0),
    (e.currentDirectiveIndex = -1),
    (e.currentNamespace = null),
    (e.bindingRootIndex = -1),
    (e.bindingIndex = -1),
    (e.currentQueryIndex = 0);
}
function mp(e) {
  return (w.lFrame.contextLView = ep(e, w.lFrame.contextLView))[$];
}
function Te() {
  return w.lFrame.selectedIndex;
}
function it(e) {
  w.lFrame.selectedIndex = e;
}
function pn() {
  let e = w.lFrame;
  return hs(e.tView, e.selectedIndex);
}
function zM() {
  w.lFrame.currentNamespace = Ic;
}
function GM() {
  yp();
}
function yp() {
  w.lFrame.currentNamespace = null;
}
function vp() {
  return w.lFrame.currentNamespace;
}
var Lc = !0;
function Zr() {
  return Lc;
}
function Yr(e) {
  Lc = e;
}
function Dp(e, t, n) {
  let { ngOnChanges: r, ngOnInit: o, ngDoCheck: i } = t.type.prototype;
  if (r) {
    let s = yc(t);
    (n.preOrderHooks ??= []).push(e, s),
      (n.preOrderCheckHooks ??= []).push(e, s);
  }
  o && (n.preOrderHooks ??= []).push(0 - e, o),
    i &&
      ((n.preOrderHooks ??= []).push(e, i),
      (n.preOrderCheckHooks ??= []).push(e, i));
}
function Qr(e, t) {
  for (let n = t.directiveStart, r = t.directiveEnd; n < r; n++) {
    let i = e.data[n].type.prototype,
      {
        ngAfterContentInit: s,
        ngAfterContentChecked: a,
        ngAfterViewInit: u,
        ngAfterViewChecked: c,
        ngOnDestroy: l,
      } = i;
    s && (e.contentHooks ??= []).push(-n, s),
      a &&
        ((e.contentHooks ??= []).push(n, a),
        (e.contentCheckHooks ??= []).push(n, a)),
      u && (e.viewHooks ??= []).push(-n, u),
      c &&
        ((e.viewHooks ??= []).push(n, c), (e.viewCheckHooks ??= []).push(n, c)),
      l != null && (e.destroyHooks ??= []).push(n, l);
  }
}
function ar(e, t, n) {
  jc(e, t, 3, n);
}
function ur(e, t, n, r) {
  (e[y] & 3) === n && jc(e, t, n, r);
}
function Vo(e, t) {
  let n = e[y];
  (n & 3) === t && ((n &= 16383), (n += 1), (e[y] = n));
}
function jc(e, t, n, r) {
  let o = r !== void 0 ? e[Ct] & 65535 : 0,
    i = r ?? -1,
    s = t.length - 1,
    a = 0;
  for (let u = o; u < s; u++)
    if (typeof t[u + 1] == 'number') {
      if (((a = t[u]), r != null && a >= r)) break;
    } else
      t[u] < 0 && (e[Ct] += 65536),
        (a < i || i == -1) &&
          (Ip(e, n, t, u), (e[Ct] = (e[Ct] & 4294901760) + u + 2)),
        u++;
}
function uu(e, t) {
  ge(4, e, t);
  let n = b(null);
  try {
    t.call(e);
  } finally {
    b(n), ge(5, e, t);
  }
}
function Ip(e, t, n, r) {
  let o = n[r] < 0,
    i = n[r + 1],
    s = o ? -n[r] : n[r],
    a = e[s];
  o
    ? e[y] >> 14 < e[Ct] >> 16 &&
      (e[y] & 3) === t &&
      ((e[y] += 16384), uu(a, i))
    : uu(a, i);
}
var Mt = -1,
  st = class {
    constructor(t, n, r) {
      (this.factory = t),
        (this.resolving = !1),
        (this.canSeeViewProviders = n),
        (this.injectImpl = r);
    }
  };
function Ep(e) {
  return e instanceof st;
}
function wp(e) {
  return (e.flags & 8) !== 0;
}
function Cp(e) {
  return (e.flags & 16) !== 0;
}
var Bo = {},
  ui = class {
    constructor(t, n) {
      (this.injector = t), (this.parentInjector = n);
    }
    get(t, n, r) {
      r = Ur(r);
      let o = this.injector.get(t, Bo, r);
      return o !== Bo || n === Bo ? o : this.parentInjector.get(t, n, r);
    }
  };
function Vc(e) {
  return e !== Mt;
}
function Er(e) {
  return e & 32767;
}
function bp(e) {
  return e >> 16;
}
function wr(e, t) {
  let n = bp(e),
    r = t;
  for (; n > 0; ) (r = r[Bt]), n--;
  return r;
}
var ci = !0;
function Cr(e) {
  let t = ci;
  return (ci = e), t;
}
var _p = 256,
  Bc = _p - 1,
  $c = 5,
  Mp = 0,
  me = {};
function xp(e, t, n) {
  let r;
  typeof n == 'string'
    ? (r = n.charCodeAt(0) || 0)
    : n.hasOwnProperty(tn) && (r = n[tn]),
    r == null && (r = n[tn] = Mp++);
  let o = r & Bc,
    i = 1 << o;
  t.data[e + (o >> $c)] |= i;
}
function br(e, t) {
  let n = Hc(e, t);
  if (n !== -1) return n;
  let r = t[v];
  r.firstCreatePass &&
    ((e.injectorIndex = t.length),
    $o(r.data, e),
    $o(t, null),
    $o(r.blueprint, null));
  let o = ws(e, t),
    i = e.injectorIndex;
  if (Vc(o)) {
    let s = Er(o),
      a = wr(o, t),
      u = a[v].data;
    for (let c = 0; c < 8; c++) t[i + c] = a[s + c] | u[s + c];
  }
  return (t[i + 8] = o), i;
}
function $o(e, t) {
  e.push(0, 0, 0, 0, 0, 0, 0, 0, t);
}
function Hc(e, t) {
  return e.injectorIndex === -1 ||
    (e.parent && e.parent.injectorIndex === e.injectorIndex) ||
    t[e.injectorIndex + 8] === null
    ? -1
    : e.injectorIndex;
}
function ws(e, t) {
  if (e.parent && e.parent.injectorIndex !== -1) return e.parent.injectorIndex;
  let n = 0,
    r = null,
    o = t;
  for (; o !== null; ) {
    if (((r = qc(o)), r === null)) return Mt;
    if ((n++, (o = o[Bt]), r.injectorIndex !== -1))
      return r.injectorIndex | (n << 16);
  }
  return Mt;
}
function li(e, t, n) {
  xp(e, t, n);
}
function Sp(e, t) {
  if (t === 'class') return e.classes;
  if (t === 'style') return e.styles;
  let n = e.attrs;
  if (n) {
    let r = n.length,
      o = 0;
    for (; o < r; ) {
      let i = n[o];
      if (Ju(i)) break;
      if (i === 0) o = o + 2;
      else if (typeof i == 'number')
        for (o++; o < r && typeof n[o] == 'string'; ) o++;
      else {
        if (i === t) return n[o + 1];
        o = o + 2;
      }
    }
  }
  return null;
}
function Uc(e, t, n) {
  if (n & _.Optional || e !== void 0) return e;
  is(t, 'NodeInjector');
}
function zc(e, t, n, r) {
  if (
    (n & _.Optional && r === void 0 && (r = null), !(n & (_.Self | _.Host)))
  ) {
    let o = e[At],
      i = Y(void 0);
    try {
      return o ? o.get(t, r, n & _.Optional) : Wu(t, r, n & _.Optional);
    } finally {
      Y(i);
    }
  }
  return Uc(r, t, n);
}
function Gc(e, t, n, r = _.Default, o) {
  if (e !== null) {
    if (t[y] & 2048 && !(r & _.Self)) {
      let s = Op(e, t, n, r, me);
      if (s !== me) return s;
    }
    let i = Wc(e, t, n, r, me);
    if (i !== me) return i;
  }
  return zc(t, n, r, o);
}
function Wc(e, t, n, r, o) {
  let i = Np(n);
  if (typeof i == 'function') {
    if (!Oc(t, e, r)) return r & _.Host ? Uc(o, n, r) : zc(t, n, r, o);
    try {
      let s;
      if (((s = i(r)), s == null && !(r & _.Optional))) is(n);
      else return s;
    } finally {
      kc();
    }
  } else if (typeof i == 'number') {
    let s = null,
      a = Hc(e, t),
      u = Mt,
      c = r & _.Host ? t[te][ee] : null;
    for (
      (a === -1 || r & _.SkipSelf) &&
      ((u = a === -1 ? ws(e, t) : t[a + 8]),
      u === Mt || !lu(r, !1)
        ? (a = -1)
        : ((s = t[v]), (a = Er(u)), (t = wr(u, t))));
      a !== -1;

    ) {
      let l = t[v];
      if (cu(i, a, l.data)) {
        let d = Tp(a, t, n, s, r, c);
        if (d !== me) return d;
      }
      (u = t[a + 8]),
        u !== Mt && lu(r, t[v].data[a + 8] === c) && cu(i, a, t)
          ? ((s = l), (a = Er(u)), (t = wr(u, t)))
          : (a = -1);
    }
  }
  return o;
}
function Tp(e, t, n, r, o, i) {
  let s = t[v],
    a = s.data[e + 8],
    u = r == null ? Gr(a) && ci : r != s && (a.type & 3) !== 0,
    c = o & _.Host && i === a,
    l = cr(a, s, n, u, c);
  return l !== null ? at(t, s, l, a) : me;
}
function cr(e, t, n, r, o) {
  let i = e.providerIndexes,
    s = t.data,
    a = i & 1048575,
    u = e.directiveStart,
    c = e.directiveEnd,
    l = i >> 20,
    d = r ? a : a + l,
    h = o ? a + l : c;
  for (let f = d; f < h; f++) {
    let p = s[f];
    if ((f < u && n === p) || (f >= u && p.type === n)) return f;
  }
  if (o) {
    let f = s[u];
    if (f && Me(f) && f.type === n) return u;
  }
  return null;
}
function at(e, t, n, r) {
  let o = e[n],
    i = t.data;
  if (Ep(o)) {
    let s = o;
    s.resolving && Kf(Qf(i[n]));
    let a = Cr(s.canSeeViewProviders);
    s.resolving = !0;
    let u,
      c = s.injectImpl ? Y(s.injectImpl) : null,
      l = Oc(e, r, _.Default);
    try {
      (o = e[n] = s.factory(void 0, i, e, r)),
        t.firstCreatePass && n >= r.directiveStart && Dp(n, i[n], t);
    } finally {
      c !== null && Y(c), Cr(a), (s.resolving = !1), kc();
    }
  }
  return o;
}
function Np(e) {
  if (typeof e == 'string') return e.charCodeAt(0) || 0;
  let t = e.hasOwnProperty(tn) ? e[tn] : void 0;
  return typeof t == 'number' ? (t >= 0 ? t & Bc : Ap) : t;
}
function cu(e, t, n) {
  let r = 1 << e;
  return !!(n[t + (e >> $c)] & r);
}
function lu(e, t) {
  return !(e & _.Self) && !(e & _.Host && t);
}
var et = class {
  constructor(t, n) {
    (this._tNode = t), (this._lView = n);
  }
  get(t, n, r) {
    return Gc(this._tNode, this._lView, t, Ur(r), n);
  }
};
function Ap() {
  return new et(V(), E());
}
function WM(e) {
  return fn(() => {
    let t = e.prototype.constructor,
      n = t[hr] || di(t),
      r = Object.prototype,
      o = Object.getPrototypeOf(e.prototype).constructor;
    for (; o && o !== r; ) {
      let i = o[hr] || di(o);
      if (i && i !== n) return i;
      o = Object.getPrototypeOf(o);
    }
    return (i) => new i();
  });
}
function di(e) {
  return Bu(e)
    ? () => {
        let t = di(W(e));
        return t && t();
      }
    : tt(e);
}
function Op(e, t, n, r, o) {
  let i = e,
    s = t;
  for (; i !== null && s !== null && s[y] & 2048 && !(s[y] & 512); ) {
    let a = Wc(i, s, n, r | _.Self, me);
    if (a !== me) return a;
    let u = i.parent;
    if (!u) {
      let c = s[pc];
      if (c) {
        let l = c.get(n, me, r);
        if (l !== me) return l;
      }
      (u = qc(s)), (s = s[Bt]);
    }
    i = u;
  }
  return o;
}
function qc(e) {
  let t = e[v],
    n = t.type;
  return n === 2 ? t.declTNode : n === 1 ? e[ee] : null;
}
function Fp(e) {
  return Sp(V(), e);
}
function du(e, t = null, n = null, r) {
  let o = Zc(e, t, n, r);
  return o.resolveInjectorInitializers(), o;
}
function Zc(e, t = null, n = null, r, o = new Set()) {
  let i = [n || Q, Fh(e)];
  return (
    (r = r || (typeof e == 'object' ? void 0 : J(e))),
    new sn(i, t || ls(), r || null, o)
  );
}
var Xe = class Xe {
  static create(t, n) {
    if (Array.isArray(t)) return du({ name: '' }, n, t, '');
    {
      let r = t.name ?? '';
      return du({ name: r }, t.parent, t.providers, r);
    }
  }
};
(Xe.THROW_IF_NOT_FOUND = nn),
  (Xe.NULL = new yr()),
  (Xe.ɵprov = P({ token: Xe, providedIn: 'any', factory: () => U(Yu) })),
  (Xe.__NG_ELEMENT_ID__ = -1);
var ut = Xe;
var Rp = new A('');
Rp.__NG_ELEMENT_ID__ = (e) => {
  let t = V();
  if (t === null) throw new S(204, !1);
  if (t.type & 2) return t.value;
  if (e & _.Optional) return null;
  throw new S(204, !1);
};
var Pp = 'ngOriginalError';
function Ho(e) {
  return e[Pp];
}
var Cs = (() => {
    let t = class t {};
    (t.__NG_ELEMENT_ID__ = kp), (t.__NG_ENV_ID__ = (r) => r);
    let e = t;
    return e;
  })(),
  fi = class extends Cs {
    constructor(t) {
      super(), (this._lView = t);
    }
    onDestroy(t) {
      return _c(this._lView, t), () => tp(this._lView, t);
    }
  };
function kp() {
  return new fi(E());
}
var Kr = (() => {
  let t = class t {
    constructor() {
      (this.taskId = 0),
        (this.pendingTasks = new Set()),
        (this.hasPendingTasks = new Zt(!1));
    }
    get _hasPendingTasks() {
      return this.hasPendingTasks.value;
    }
    add() {
      this._hasPendingTasks || this.hasPendingTasks.next(!0);
      let r = this.taskId++;
      return this.pendingTasks.add(r), r;
    }
    remove(r) {
      this.pendingTasks.delete(r),
        this.pendingTasks.size === 0 &&
          this._hasPendingTasks &&
          this.hasPendingTasks.next(!1);
    }
    ngOnDestroy() {
      this.pendingTasks.clear(),
        this._hasPendingTasks && this.hasPendingTasks.next(!1);
    }
  };
  t.ɵprov = P({ token: t, providedIn: 'root', factory: () => new t() });
  let e = t;
  return e;
})();
var hi = class extends re {
    constructor(t = !1) {
      super(),
        (this.destroyRef = void 0),
        (this.pendingTasks = void 0),
        (this.__isAsync = t),
        hc() &&
          ((this.destroyRef = x(Cs, { optional: !0 }) ?? void 0),
          (this.pendingTasks = x(Kr, { optional: !0 }) ?? void 0));
    }
    emit(t) {
      let n = b(null);
      try {
        super.next(t);
      } finally {
        b(n);
      }
    }
    subscribe(t, n, r) {
      let o = t,
        i = n || (() => null),
        s = r;
      if (t && typeof t == 'object') {
        let u = t;
        (o = u.next?.bind(u)),
          (i = u.error?.bind(u)),
          (s = u.complete?.bind(u));
      }
      this.__isAsync &&
        ((i = this.wrapInTimeout(i)),
        o && (o = this.wrapInTimeout(o)),
        s && (s = this.wrapInTimeout(s)));
      let a = super.subscribe({ next: o, error: i, complete: s });
      return t instanceof k && t.add(a), a;
    }
    wrapInTimeout(t) {
      return (n) => {
        let r = this.pendingTasks?.add();
        setTimeout(() => {
          t(n), r !== void 0 && this.pendingTasks?.remove(r);
        });
      };
    }
  },
  de = hi;
function _r(...e) {}
function Yc(e) {
  let t, n;
  function r() {
    e = _r;
    try {
      n !== void 0 &&
        typeof cancelAnimationFrame == 'function' &&
        cancelAnimationFrame(n),
        t !== void 0 && clearTimeout(t);
    } catch {}
  }
  return (
    (t = setTimeout(() => {
      e(), r();
    })),
    typeof requestAnimationFrame == 'function' &&
      (n = requestAnimationFrame(() => {
        e(), r();
      })),
    () => r()
  );
}
function fu(e) {
  return (
    queueMicrotask(() => e()),
    () => {
      e = _r;
    }
  );
}
var bs = 'isAngularZone',
  Mr = bs + '_ID',
  Lp = 0,
  X = class e {
    constructor({
      enableLongStackTrace: t = !1,
      shouldCoalesceEventChangeDetection: n = !1,
      shouldCoalesceRunChangeDetection: r = !1,
    }) {
      if (
        ((this.hasPendingMacrotasks = !1),
        (this.hasPendingMicrotasks = !1),
        (this.isStable = !0),
        (this.onUnstable = new de(!1)),
        (this.onMicrotaskEmpty = new de(!1)),
        (this.onStable = new de(!1)),
        (this.onError = new de(!1)),
        typeof Zone > 'u')
      )
        throw new S(908, !1);
      Zone.assertZonePatched();
      let o = this;
      (o._nesting = 0),
        (o._outer = o._inner = Zone.current),
        Zone.TaskTrackingZoneSpec &&
          (o._inner = o._inner.fork(new Zone.TaskTrackingZoneSpec())),
        t &&
          Zone.longStackTraceZoneSpec &&
          (o._inner = o._inner.fork(Zone.longStackTraceZoneSpec)),
        (o.shouldCoalesceEventChangeDetection = !r && n),
        (o.shouldCoalesceRunChangeDetection = r),
        (o.callbackScheduled = !1),
        Bp(o);
    }
    static isInAngularZone() {
      return typeof Zone < 'u' && Zone.current.get(bs) === !0;
    }
    static assertInAngularZone() {
      if (!e.isInAngularZone()) throw new S(909, !1);
    }
    static assertNotInAngularZone() {
      if (e.isInAngularZone()) throw new S(909, !1);
    }
    run(t, n, r) {
      return this._inner.run(t, n, r);
    }
    runTask(t, n, r, o) {
      let i = this._inner,
        s = i.scheduleEventTask('NgZoneEvent: ' + o, t, jp, _r, _r);
      try {
        return i.runTask(s, n, r);
      } finally {
        i.cancelTask(s);
      }
    }
    runGuarded(t, n, r) {
      return this._inner.runGuarded(t, n, r);
    }
    runOutsideAngular(t) {
      return this._outer.run(t);
    }
  },
  jp = {};
function _s(e) {
  if (e._nesting == 0 && !e.hasPendingMicrotasks && !e.isStable)
    try {
      e._nesting++, e.onMicrotaskEmpty.emit(null);
    } finally {
      if ((e._nesting--, !e.hasPendingMicrotasks))
        try {
          e.runOutsideAngular(() => e.onStable.emit(null));
        } finally {
          e.isStable = !0;
        }
    }
}
function Vp(e) {
  e.isCheckStableRunning ||
    e.callbackScheduled ||
    ((e.callbackScheduled = !0),
    Zone.root.run(() => {
      Yc(() => {
        (e.callbackScheduled = !1),
          pi(e),
          (e.isCheckStableRunning = !0),
          _s(e),
          (e.isCheckStableRunning = !1);
      });
    }),
    pi(e));
}
function Bp(e) {
  let t = () => {
      Vp(e);
    },
    n = Lp++;
  e._inner = e._inner.fork({
    name: 'angular',
    properties: { [bs]: !0, [Mr]: n, [Mr + n]: !0 },
    onInvokeTask: (r, o, i, s, a, u) => {
      if ($p(u)) return r.invokeTask(i, s, a, u);
      try {
        return hu(e), r.invokeTask(i, s, a, u);
      } finally {
        ((e.shouldCoalesceEventChangeDetection && s.type === 'eventTask') ||
          e.shouldCoalesceRunChangeDetection) &&
          t(),
          pu(e);
      }
    },
    onInvoke: (r, o, i, s, a, u, c) => {
      try {
        return hu(e), r.invoke(i, s, a, u, c);
      } finally {
        e.shouldCoalesceRunChangeDetection &&
          !e.callbackScheduled &&
          !Hp(u) &&
          t(),
          pu(e);
      }
    },
    onHasTask: (r, o, i, s) => {
      r.hasTask(i, s),
        o === i &&
          (s.change == 'microTask'
            ? ((e._hasPendingMicrotasks = s.microTask), pi(e), _s(e))
            : s.change == 'macroTask' &&
              (e.hasPendingMacrotasks = s.macroTask));
    },
    onHandleError: (r, o, i, s) => (
      r.handleError(i, s), e.runOutsideAngular(() => e.onError.emit(s)), !1
    ),
  });
}
function pi(e) {
  e._hasPendingMicrotasks ||
  ((e.shouldCoalesceEventChangeDetection ||
    e.shouldCoalesceRunChangeDetection) &&
    e.callbackScheduled === !0)
    ? (e.hasPendingMicrotasks = !0)
    : (e.hasPendingMicrotasks = !1);
}
function hu(e) {
  e._nesting++, e.isStable && ((e.isStable = !1), e.onUnstable.emit(null));
}
function pu(e) {
  e._nesting--, _s(e);
}
var gi = class {
  constructor() {
    (this.hasPendingMicrotasks = !1),
      (this.hasPendingMacrotasks = !1),
      (this.isStable = !0),
      (this.onUnstable = new de()),
      (this.onMicrotaskEmpty = new de()),
      (this.onStable = new de()),
      (this.onError = new de());
  }
  run(t, n, r) {
    return t.apply(n, r);
  }
  runGuarded(t, n, r) {
    return t.apply(n, r);
  }
  runOutsideAngular(t) {
    return t();
  }
  runTask(t, n, r, o) {
    return t.apply(n, r);
  }
};
function $p(e) {
  return Qc(e, '__ignore_ng_zone__');
}
function Hp(e) {
  return Qc(e, '__scheduler_tick__');
}
function Qc(e, t) {
  return !Array.isArray(e) || e.length !== 1 ? !1 : e[0]?.data?.[t] === !0;
}
var Ft = class {
    constructor() {
      this._console = console;
    }
    handleError(t) {
      let n = this._findOriginalError(t);
      this._console.error('ERROR', t),
        n && this._console.error('ORIGINAL ERROR', n);
    }
    _findOriginalError(t) {
      let n = t && Ho(t);
      for (; n && Ho(n); ) n = Ho(n);
      return n || null;
    }
  },
  Up = new A('', {
    providedIn: 'root',
    factory: () => {
      let e = x(X),
        t = x(Ft);
      return (n) => e.runOutsideAngular(() => t.handleError(n));
    },
  });
function zp() {
  return $t(V(), E());
}
function $t(e, t) {
  return new Ht(ie(e, t));
}
var Ht = (() => {
  let t = class t {
    constructor(r) {
      this.nativeElement = r;
    }
  };
  t.__NG_ELEMENT_ID__ = zp;
  let e = t;
  return e;
})();
function Gp(e) {
  return e instanceof Ht ? e.nativeElement : e;
}
function Wp() {
  return this._results[Symbol.iterator]();
}
var mi = class e {
  get changes() {
    return (this._changes ??= new de());
  }
  constructor(t = !1) {
    (this._emitDistinctChangesOnly = t),
      (this.dirty = !0),
      (this._onDirty = void 0),
      (this._results = []),
      (this._changesDetected = !1),
      (this._changes = void 0),
      (this.length = 0),
      (this.first = void 0),
      (this.last = void 0);
    let n = e.prototype;
    n[Symbol.iterator] || (n[Symbol.iterator] = Wp);
  }
  get(t) {
    return this._results[t];
  }
  map(t) {
    return this._results.map(t);
  }
  filter(t) {
    return this._results.filter(t);
  }
  find(t) {
    return this._results.find(t);
  }
  reduce(t, n) {
    return this._results.reduce(t, n);
  }
  forEach(t) {
    this._results.forEach(t);
  }
  some(t) {
    return this._results.some(t);
  }
  toArray() {
    return this._results.slice();
  }
  toString() {
    return this._results.toString();
  }
  reset(t, n) {
    this.dirty = !1;
    let r = lh(t);
    (this._changesDetected = !ch(this._results, r, n)) &&
      ((this._results = r),
      (this.length = r.length),
      (this.last = r[this.length - 1]),
      (this.first = r[0]));
  }
  notifyOnChanges() {
    this._changes !== void 0 &&
      (this._changesDetected || !this._emitDistinctChangesOnly) &&
      this._changes.emit(this);
  }
  onDirty(t) {
    this._onDirty = t;
  }
  setDirty() {
    (this.dirty = !0), this._onDirty?.();
  }
  destroy() {
    this._changes !== void 0 &&
      (this._changes.complete(), this._changes.unsubscribe());
  }
};
function Kc(e) {
  return (e.flags & 128) === 128;
}
var Jc = new Map(),
  qp = 0;
function Zp() {
  return qp++;
}
function Yp(e) {
  Jc.set(e[zr], e);
}
function Qp(e) {
  Jc.delete(e[zr]);
}
var gu = '__ngContext__';
function $e(e, t) {
  ke(t) ? ((e[gu] = t[zr]), Yp(t)) : (e[gu] = t);
}
function Xc(e) {
  return tl(e[an]);
}
function el(e) {
  return tl(e[fe]);
}
function tl(e) {
  for (; e !== null && !Se(e); ) e = e[fe];
  return e;
}
var yi;
function qM(e) {
  yi = e;
}
function Kp() {
  if (yi !== void 0) return yi;
  if (typeof document < 'u') return document;
  throw new S(210, !1);
}
var ZM = new A('', { providedIn: 'root', factory: () => Jp }),
  Jp = 'ng',
  Xp = new A(''),
  Ms = new A('', { providedIn: 'platform', factory: () => 'unknown' });
var YM = new A(''),
  QM = new A('', {
    providedIn: 'root',
    factory: () =>
      Kp().body?.querySelector('[ngCspNonce]')?.getAttribute('ngCspNonce') ||
      null,
  });
var eg = 'h',
  tg = 'b';
var ng = () => null;
function xs(e, t, n = !1) {
  return ng(e, t, n);
}
var nl = !1,
  rg = new A('', { providedIn: 'root', factory: () => nl });
var er;
function og() {
  if (er === void 0 && ((er = null), fr.trustedTypes))
    try {
      er = fr.trustedTypes.createPolicy('angular', {
        createHTML: (e) => e,
        createScript: (e) => e,
        createScriptURL: (e) => e,
      });
    } catch {}
  return er;
}
function Jr(e) {
  return og()?.createHTML(e) || e;
}
var tr;
function ig() {
  if (tr === void 0 && ((tr = null), fr.trustedTypes))
    try {
      tr = fr.trustedTypes.createPolicy('angular#unsafe-bypass', {
        createHTML: (e) => e,
        createScript: (e) => e,
        createScriptURL: (e) => e,
      });
    } catch {}
  return tr;
}
function mu(e) {
  return ig()?.createScriptURL(e) || e;
}
var xe = class {
    constructor(t) {
      this.changingThisBreaksApplicationSecurity = t;
    }
    toString() {
      return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${ku})`;
    }
  },
  vi = class extends xe {
    getTypeName() {
      return 'HTML';
    }
  },
  Di = class extends xe {
    getTypeName() {
      return 'Style';
    }
  },
  Ii = class extends xe {
    getTypeName() {
      return 'Script';
    }
  },
  Ei = class extends xe {
    getTypeName() {
      return 'URL';
    }
  },
  wi = class extends xe {
    getTypeName() {
      return 'ResourceURL';
    }
  };
function gn(e) {
  return e instanceof xe ? e.changingThisBreaksApplicationSecurity : e;
}
function rl(e, t) {
  let n = sg(e);
  if (n != null && n !== t) {
    if (n === 'ResourceURL' && t === 'URL') return !0;
    throw new Error(`Required a safe ${t}, got a ${n} (see ${ku})`);
  }
  return n === t;
}
function sg(e) {
  return (e instanceof xe && e.getTypeName()) || null;
}
function KM(e) {
  return new vi(e);
}
function JM(e) {
  return new Di(e);
}
function XM(e) {
  return new Ii(e);
}
function e0(e) {
  return new Ei(e);
}
function t0(e) {
  return new wi(e);
}
function ag(e) {
  let t = new bi(e);
  return ug() ? new Ci(t) : t;
}
var Ci = class {
    constructor(t) {
      this.inertDocumentHelper = t;
    }
    getInertBodyElement(t) {
      t = '<body><remove></remove>' + t;
      try {
        let n = new window.DOMParser().parseFromString(Jr(t), 'text/html').body;
        return n === null
          ? this.inertDocumentHelper.getInertBodyElement(t)
          : (n.firstChild?.remove(), n);
      } catch {
        return null;
      }
    }
  },
  bi = class {
    constructor(t) {
      (this.defaultDoc = t),
        (this.inertDocument =
          this.defaultDoc.implementation.createHTMLDocument(
            'sanitization-inert'
          ));
    }
    getInertBodyElement(t) {
      let n = this.inertDocument.createElement('template');
      return (n.innerHTML = Jr(t)), n;
    }
  };
function ug() {
  try {
    return !!new window.DOMParser().parseFromString(Jr(''), 'text/html');
  } catch {
    return !1;
  }
}
var cg = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;
function ol(e) {
  return (e = String(e)), e.match(cg) ? e : 'unsafe:' + e;
}
function Ne(e) {
  let t = {};
  for (let n of e.split(',')) t[n] = !0;
  return t;
}
function mn(...e) {
  let t = {};
  for (let n of e) for (let r in n) n.hasOwnProperty(r) && (t[r] = !0);
  return t;
}
var il = Ne('area,br,col,hr,img,wbr'),
  sl = Ne('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr'),
  al = Ne('rp,rt'),
  lg = mn(al, sl),
  dg = mn(
    sl,
    Ne(
      'address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul'
    )
  ),
  fg = mn(
    al,
    Ne(
      'a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video'
    )
  ),
  yu = mn(il, dg, fg, lg),
  ul = Ne('background,cite,href,itemtype,longdesc,poster,src,xlink:href'),
  hg = Ne(
    'abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width'
  ),
  pg = Ne(
    'aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext'
  ),
  gg = mn(ul, hg, pg),
  mg = Ne('script,style,template'),
  _i = class {
    constructor() {
      (this.sanitizedSomething = !1), (this.buf = []);
    }
    sanitizeChildren(t) {
      let n = t.firstChild,
        r = !0,
        o = [];
      for (; n; ) {
        if (
          (n.nodeType === Node.ELEMENT_NODE
            ? (r = this.startElement(n))
            : n.nodeType === Node.TEXT_NODE
              ? this.chars(n.nodeValue)
              : (this.sanitizedSomething = !0),
          r && n.firstChild)
        ) {
          o.push(n), (n = Dg(n));
          continue;
        }
        for (; n; ) {
          n.nodeType === Node.ELEMENT_NODE && this.endElement(n);
          let i = vg(n);
          if (i) {
            n = i;
            break;
          }
          n = o.pop();
        }
      }
      return this.buf.join('');
    }
    startElement(t) {
      let n = vu(t).toLowerCase();
      if (!yu.hasOwnProperty(n))
        return (this.sanitizedSomething = !0), !mg.hasOwnProperty(n);
      this.buf.push('<'), this.buf.push(n);
      let r = t.attributes;
      for (let o = 0; o < r.length; o++) {
        let i = r.item(o),
          s = i.name,
          a = s.toLowerCase();
        if (!gg.hasOwnProperty(a)) {
          this.sanitizedSomething = !0;
          continue;
        }
        let u = i.value;
        ul[a] && (u = ol(u)), this.buf.push(' ', s, '="', Du(u), '"');
      }
      return this.buf.push('>'), !0;
    }
    endElement(t) {
      let n = vu(t).toLowerCase();
      yu.hasOwnProperty(n) &&
        !il.hasOwnProperty(n) &&
        (this.buf.push('</'), this.buf.push(n), this.buf.push('>'));
    }
    chars(t) {
      this.buf.push(Du(t));
    }
  };
function yg(e, t) {
  return (
    (e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY) !==
    Node.DOCUMENT_POSITION_CONTAINED_BY
  );
}
function vg(e) {
  let t = e.nextSibling;
  if (t && e !== t.previousSibling) throw cl(t);
  return t;
}
function Dg(e) {
  let t = e.firstChild;
  if (t && yg(e, t)) throw cl(t);
  return t;
}
function vu(e) {
  let t = e.nodeName;
  return typeof t == 'string' ? t : 'FORM';
}
function cl(e) {
  return new Error(
    `Failed to sanitize html because the element is clobbered: ${e.outerHTML}`
  );
}
var Ig = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
  Eg = /([^\#-~ |!])/g;
function Du(e) {
  return e
    .replace(/&/g, '&amp;')
    .replace(Ig, function (t) {
      let n = t.charCodeAt(0),
        r = t.charCodeAt(1);
      return '&#' + ((n - 55296) * 1024 + (r - 56320) + 65536) + ';';
    })
    .replace(Eg, function (t) {
      return '&#' + t.charCodeAt(0) + ';';
    })
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
var nr;
function n0(e, t) {
  let n = null;
  try {
    nr = nr || ag(e);
    let r = t ? String(t) : '';
    n = nr.getInertBodyElement(r);
    let o = 5,
      i = r;
    do {
      if (o === 0)
        throw new Error(
          'Failed to sanitize html because the input is unstable'
        );
      o--, (r = i), (i = n.innerHTML), (n = nr.getInertBodyElement(r));
    } while (r !== i);
    let a = new _i().sanitizeChildren(Iu(n) || n);
    return Jr(a);
  } finally {
    if (n) {
      let r = Iu(n) || n;
      for (; r.firstChild; ) r.firstChild.remove();
    }
  }
}
function Iu(e) {
  return 'content' in e && wg(e) ? e.content : null;
}
function wg(e) {
  return e.nodeType === Node.ELEMENT_NODE && e.nodeName === 'TEMPLATE';
}
var Ss = (function (e) {
  return (
    (e[(e.NONE = 0)] = 'NONE'),
    (e[(e.HTML = 1)] = 'HTML'),
    (e[(e.STYLE = 2)] = 'STYLE'),
    (e[(e.SCRIPT = 3)] = 'SCRIPT'),
    (e[(e.URL = 4)] = 'URL'),
    (e[(e.RESOURCE_URL = 5)] = 'RESOURCE_URL'),
    e
  );
})(Ss || {});
function Cg(e) {
  let t = ll();
  return t ? t.sanitize(Ss.URL, e) || '' : rl(e, 'URL') ? gn(e) : ol(xt(e));
}
function bg(e) {
  let t = ll();
  if (t) return mu(t.sanitize(Ss.RESOURCE_URL, e) || '');
  if (rl(e, 'ResourceURL')) return mu(gn(e));
  throw new S(904, !1);
}
function _g(e, t) {
  return (t === 'src' &&
    (e === 'embed' ||
      e === 'frame' ||
      e === 'iframe' ||
      e === 'media' ||
      e === 'script')) ||
    (t === 'href' && (e === 'base' || e === 'link'))
    ? bg
    : Cg;
}
function r0(e, t, n) {
  return _g(t, n)(e);
}
function ll() {
  let e = E();
  return e && e[ye].sanitizer;
}
var Mg = /^>|^->|<!--|-->|--!>|<!-$/g,
  xg = /(<|>)/g,
  Sg = '\u200B$1\u200B';
function Tg(e) {
  return e.replace(Mg, (t) => t.replace(xg, Sg));
}
function dl(e) {
  return e instanceof Function ? e() : e;
}
function Ng(e) {
  return (e ?? x(ut)).get(Ms) === 'browser';
}
var xr = (function (e) {
    return (
      (e[(e.Important = 1)] = 'Important'),
      (e[(e.DashCase = 2)] = 'DashCase'),
      e
    );
  })(xr || {}),
  Ag;
function Ts(e, t) {
  return Ag(e, t);
}
function bt(e, t, n, r, o) {
  if (r != null) {
    let i,
      s = !1;
    Se(r) ? (i = r) : ke(r) && ((s = !0), (r = r[De]));
    let a = ve(r);
    e === 0 && n !== null
      ? o == null
        ? ml(t, n, a)
        : Sr(t, n, a, o || null, !0)
      : e === 1 && n !== null
        ? Sr(t, n, a, o || null, !0)
        : e === 2
          ? Gg(t, a, s)
          : e === 3 && t.destroyNode(a),
      i != null && qg(t, e, i, n, o);
  }
}
function Og(e, t) {
  return e.createText(t);
}
function Fg(e, t, n) {
  e.setValue(t, n);
}
function Rg(e, t) {
  return e.createComment(Tg(t));
}
function fl(e, t, n) {
  return e.createElement(t, n);
}
function Pg(e, t) {
  hl(e, t), (t[De] = null), (t[ee] = null);
}
function kg(e, t, n, r, o, i) {
  (r[De] = o), (r[ee] = t), to(e, r, n, 1, o, i);
}
function hl(e, t) {
  t[ye].changeDetectionScheduler?.notify(8), to(e, t, t[R], 2, null, null);
}
function Lg(e) {
  let t = e[an];
  if (!t) return Uo(e[v], e);
  for (; t; ) {
    let n = null;
    if (ke(t)) n = t[an];
    else {
      let r = t[H];
      r && (n = r);
    }
    if (!n) {
      for (; t && !t[fe] && t !== e; ) ke(t) && Uo(t[v], t), (t = t[z]);
      t === null && (t = e), ke(t) && Uo(t[v], t), (n = t && t[fe]);
    }
    t = n;
  }
}
function jg(e, t, n, r) {
  let o = H + r,
    i = n.length;
  r > 0 && (n[o - 1][fe] = t),
    r < i - H ? ((t[fe] = n[o]), Zu(n, H + r, t)) : (n.push(t), (t[fe] = null)),
    (t[z] = n);
  let s = t[nt];
  s !== null && n !== s && pl(s, t);
  let a = t[_e];
  a !== null && a.insertView(e), si(t), (t[y] |= 128);
}
function pl(e, t) {
  let n = e[Ot],
    r = t[z];
  if (ke(r)) e[y] |= Ir.HasTransplantedViews;
  else {
    let o = r[z][te];
    t[te] !== o && (e[y] |= Ir.HasTransplantedViews);
  }
  n === null ? (e[Ot] = [t]) : n.push(t);
}
function Ns(e, t) {
  let n = e[Ot],
    r = n.indexOf(t);
  n.splice(r, 1);
}
function cn(e, t) {
  if (e.length <= H) return;
  let n = H + t,
    r = e[n];
  if (r) {
    let o = r[nt];
    o !== null && o !== e && Ns(o, r), t > 0 && (e[n - 1][fe] = r[fe]);
    let i = gr(e, H + t);
    Pg(r[v], r);
    let s = i[_e];
    s !== null && s.detachView(i[v]),
      (r[z] = null),
      (r[fe] = null),
      (r[y] &= -129);
  }
  return r;
}
function Xr(e, t) {
  if (!(t[y] & 256)) {
    let n = t[R];
    n.destroyNode && to(e, t, n, 3, null, null), Lg(t);
  }
}
function Uo(e, t) {
  if (t[y] & 256) return;
  let n = b(null);
  try {
    (t[y] &= -129),
      (t[y] |= 256),
      t[oe] && vo(t[oe]),
      Bg(e, t),
      Vg(e, t),
      t[v].type === 1 && t[R].destroy();
    let r = t[nt];
    if (r !== null && Se(t[z])) {
      r !== t[z] && Ns(r, t);
      let o = t[_e];
      o !== null && o.detachView(e);
    }
    Qp(t);
  } finally {
    b(n);
  }
}
function Vg(e, t) {
  let n = e.cleanup,
    r = t[vr];
  if (n !== null)
    for (let i = 0; i < n.length - 1; i += 2)
      if (typeof n[i] == 'string') {
        let s = n[i + 3];
        s >= 0 ? r[s]() : r[-s].unsubscribe(), (i += 2);
      } else {
        let s = r[n[i + 1]];
        n[i].call(s);
      }
  r !== null && (t[vr] = null);
  let o = t[Pe];
  if (o !== null) {
    t[Pe] = null;
    for (let i = 0; i < o.length; i++) {
      let s = o[i];
      s();
    }
  }
}
function Bg(e, t) {
  let n;
  if (e != null && (n = e.destroyHooks) != null)
    for (let r = 0; r < n.length; r += 2) {
      let o = t[n[r]];
      if (!(o instanceof st)) {
        let i = n[r + 1];
        if (Array.isArray(i))
          for (let s = 0; s < i.length; s += 2) {
            let a = o[i[s]],
              u = i[s + 1];
            ge(4, a, u);
            try {
              u.call(a);
            } finally {
              ge(5, a, u);
            }
          }
        else {
          ge(4, o, i);
          try {
            i.call(o);
          } finally {
            ge(5, o, i);
          }
        }
      }
    }
}
function gl(e, t, n) {
  return $g(e, t.parent, n);
}
function $g(e, t, n) {
  let r = t;
  for (; r !== null && r.type & 168; ) (t = r), (r = t.parent);
  if (r === null) return n[De];
  {
    let { componentOffset: o } = r;
    if (o > -1) {
      let { encapsulation: i } = e.data[r.directiveStart + o];
      if (i === rn.None || i === rn.Emulated) return null;
    }
    return ie(r, n);
  }
}
function Sr(e, t, n, r, o) {
  e.insertBefore(t, n, r, o);
}
function ml(e, t, n) {
  e.appendChild(t, n);
}
function Eu(e, t, n, r, o) {
  r !== null ? Sr(e, t, n, r, o) : ml(e, t, n);
}
function yl(e, t) {
  return e.parentNode(t);
}
function Hg(e, t) {
  return e.nextSibling(t);
}
function vl(e, t, n) {
  return zg(e, t, n);
}
function Ug(e, t, n) {
  return e.type & 40 ? ie(e, n) : null;
}
var zg = Ug,
  wu;
function eo(e, t, n, r) {
  let o = gl(e, r, t),
    i = t[R],
    s = r.parent || t[ee],
    a = vl(s, r, t);
  if (o != null)
    if (Array.isArray(n))
      for (let u = 0; u < n.length; u++) Eu(i, o, n[u], a, !1);
    else Eu(i, o, n, a, !1);
  wu !== void 0 && wu(i, r, t, n, o);
}
function en(e, t) {
  if (t !== null) {
    let n = t.type;
    if (n & 3) return ie(t, e);
    if (n & 4) return Mi(-1, e[t.index]);
    if (n & 8) {
      let r = t.child;
      if (r !== null) return en(e, r);
      {
        let o = e[t.index];
        return Se(o) ? Mi(-1, o) : ve(o);
      }
    } else {
      if (n & 128) return en(e, t.next);
      if (n & 32) return Ts(t, e)() || ve(e[t.index]);
      {
        let r = Dl(e, t);
        if (r !== null) {
          if (Array.isArray(r)) return r[0];
          let o = ot(e[te]);
          return en(o, r);
        } else return en(e, t.next);
      }
    }
  }
  return null;
}
function Dl(e, t) {
  if (t !== null) {
    let r = e[te][ee],
      o = t.projection;
    return r.projection[o];
  }
  return null;
}
function Mi(e, t) {
  let n = H + e + 1;
  if (n < t.length) {
    let r = t[n],
      o = r[v].firstChild;
    if (o !== null) return en(r, o);
  }
  return t[rt];
}
function Gg(e, t, n) {
  e.removeChild(null, t, n);
}
function As(e, t, n, r, o, i, s) {
  for (; n != null; ) {
    if (n.type === 128) {
      n = n.next;
      continue;
    }
    let a = r[n.index],
      u = n.type;
    if (
      (s && t === 0 && (a && $e(ve(a), r), (n.flags |= 2)),
      (n.flags & 32) !== 32)
    )
      if (u & 8) As(e, t, n.child, r, o, i, !1), bt(t, e, o, a, i);
      else if (u & 32) {
        let c = Ts(n, r),
          l;
        for (; (l = c()); ) bt(t, e, o, l, i);
        bt(t, e, o, a, i);
      } else u & 16 ? Il(e, t, r, n, o, i) : bt(t, e, o, a, i);
    n = s ? n.projectionNext : n.next;
  }
}
function to(e, t, n, r, o, i) {
  As(n, r, e.firstChild, t, o, i, !1);
}
function Wg(e, t, n) {
  let r = t[R],
    o = gl(e, n, t),
    i = n.parent || t[ee],
    s = vl(i, n, t);
  Il(r, 0, t, n, o, s);
}
function Il(e, t, n, r, o, i) {
  let s = n[te],
    u = s[ee].projection[r.projection];
  if (Array.isArray(u))
    for (let c = 0; c < u.length; c++) {
      let l = u[c];
      bt(t, e, o, l, i);
    }
  else {
    let c = u,
      l = s[z];
    Kc(r) && (c.flags |= 128), As(e, t, c, l, o, i, !0);
  }
}
function qg(e, t, n, r, o) {
  let i = n[rt],
    s = ve(n);
  i !== s && bt(t, e, r, i, o);
  for (let a = H; a < n.length; a++) {
    let u = n[a];
    to(u[v], u, e, t, r, i);
  }
}
function Zg(e, t, n, r, o) {
  if (t) o ? e.addClass(n, r) : e.removeClass(n, r);
  else {
    let i = r.indexOf('-') === -1 ? void 0 : xr.DashCase;
    o == null
      ? e.removeStyle(n, r, i)
      : (typeof o == 'string' &&
          o.endsWith('!important') &&
          ((o = o.slice(0, -10)), (i |= xr.Important)),
        e.setStyle(n, r, o, i));
  }
}
function Yg(e, t, n) {
  e.setAttribute(t, 'style', n);
}
function El(e, t, n) {
  n === '' ? e.removeAttribute(t, 'class') : e.setAttribute(t, 'class', n);
}
function wl(e, t, n) {
  let { mergedAttrs: r, classes: o, styles: i } = n;
  r !== null && ei(e, t, r),
    o !== null && El(e, t, o),
    i !== null && Yg(e, t, i);
}
var se = {};
function o0(e = 1) {
  Cl(F(), E(), Te() + e, !1);
}
function Cl(e, t, n, r) {
  if (!r)
    if ((t[y] & 3) === 3) {
      let i = e.preOrderCheckHooks;
      i !== null && ar(t, i, n);
    } else {
      let i = e.preOrderHooks;
      i !== null && ur(t, i, 0, n);
    }
  it(n);
}
function Ut(e, t = _.Default) {
  let n = E();
  if (n === null) return U(e, t);
  let r = V();
  return Gc(r, n, W(e), t);
}
function i0() {
  let e = 'invalid';
  throw new Error(e);
}
function bl(e, t, n, r, o, i) {
  let s = b(null);
  try {
    let a = null;
    o & Le.SignalBased && (a = t[r][Ee]),
      a !== null && a.transformFn !== void 0 && (i = a.transformFn(i)),
      o & Le.HasDecoratorInputTransform &&
        (i = e.inputTransforms[r].call(t, i)),
      e.setInput !== null ? e.setInput(t, a, i, n, r) : gc(t, a, r, i);
  } finally {
    b(s);
  }
}
function Qg(e, t) {
  let n = e.hostBindingOpCodes;
  if (n !== null)
    try {
      for (let r = 0; r < n.length; r++) {
        let o = n[r];
        if (o < 0) it(~o);
        else {
          let i = o,
            s = n[++r],
            a = n[++r];
          hp(s, i);
          let u = t[i];
          a(2, u);
        }
      }
    } finally {
      it(-1);
    }
}
function no(e, t, n, r, o, i, s, a, u, c, l) {
  let d = t.blueprint.slice();
  return (
    (d[De] = o),
    (d[y] = r | 4 | 128 | 8 | 64),
    (c !== null || (e && e[y] & 2048)) && (d[y] |= 2048),
    Cc(d),
    (d[z] = d[Bt] = e),
    (d[$] = n),
    (d[ye] = s || (e && e[ye])),
    (d[R] = a || (e && e[R])),
    (d[At] = u || (e && e[At]) || null),
    (d[ee] = i),
    (d[zr] = Zp()),
    (d[Nt] = l),
    (d[pc] = c),
    (d[te] = t.type == 2 ? e[te] : d),
    d
  );
}
function zt(e, t, n, r, o) {
  let i = e.data[t];
  if (i === null) (i = Kg(e, t, n, r, o)), fp() && (i.flags |= 32);
  else if (i.type & 64) {
    (i.type = n), (i.value = r), (i.attrs = o);
    let s = ap();
    i.injectorIndex = s === null ? -1 : s.injectorIndex;
  }
  return dt(i, !0), i;
}
function Kg(e, t, n, r, o) {
  let i = Tc(),
    s = gs(),
    a = s ? i : i && i.parent,
    u = (e.data[t] = rm(e, a, n, t, r, o));
  return (
    e.firstChild === null && (e.firstChild = u),
    i !== null &&
      (s
        ? i.child == null && u.parent !== null && (i.child = u)
        : i.next === null && ((i.next = u), (u.prev = i))),
    u
  );
}
function _l(e, t, n, r) {
  if (n === 0) return -1;
  let o = t.length;
  for (let i = 0; i < n; i++) t.push(r), e.blueprint.push(r), e.data.push(null);
  return o;
}
function Ml(e, t, n, r, o) {
  let i = Te(),
    s = r & 2;
  try {
    it(-1), s && t.length > B && Cl(e, t, B, !1), ge(s ? 2 : 0, o), n(r, o);
  } finally {
    it(i), ge(s ? 3 : 1, o);
  }
}
function Os(e, t, n) {
  if (fs(t)) {
    let r = b(null);
    try {
      let o = t.directiveStart,
        i = t.directiveEnd;
      for (let s = o; s < i; s++) {
        let a = e.data[s];
        if (a.contentQueries) {
          let u = n[s];
          a.contentQueries(1, u, s);
        }
      }
    } finally {
      b(r);
    }
  }
}
function Fs(e, t, n) {
  xc() && (cm(e, t, n, ie(n, t)), (n.flags & 64) === 64 && Tl(e, t, n));
}
function Rs(e, t, n = ie) {
  let r = t.localNames;
  if (r !== null) {
    let o = t.index + 1;
    for (let i = 0; i < r.length; i += 2) {
      let s = r[i + 1],
        a = s === -1 ? n(t, e) : e[s];
      e[o++] = a;
    }
  }
}
function xl(e) {
  let t = e.tView;
  return t === null || t.incompleteFirstPass
    ? (e.tView = Ps(
        1,
        null,
        e.template,
        e.decls,
        e.vars,
        e.directiveDefs,
        e.pipeDefs,
        e.viewQuery,
        e.schemas,
        e.consts,
        e.id
      ))
    : t;
}
function Ps(e, t, n, r, o, i, s, a, u, c, l) {
  let d = B + r,
    h = d + o,
    f = Jg(d, h),
    p = typeof c == 'function' ? c() : c;
  return (f[v] = {
    type: e,
    blueprint: f,
    template: n,
    queries: null,
    viewQuery: a,
    declTNode: t,
    data: f.slice().fill(null, d),
    bindingStartIndex: d,
    expandoStartIndex: h,
    hostBindingOpCodes: null,
    firstCreatePass: !0,
    firstUpdatePass: !0,
    staticViewQueries: !1,
    staticContentQueries: !1,
    preOrderHooks: null,
    preOrderCheckHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof i == 'function' ? i() : i,
    pipeRegistry: typeof s == 'function' ? s() : s,
    firstChild: null,
    schemas: u,
    consts: p,
    incompleteFirstPass: !1,
    ssrId: l,
  });
}
function Jg(e, t) {
  let n = [];
  for (let r = 0; r < t; r++) n.push(r < e ? null : se);
  return n;
}
function Xg(e, t, n, r) {
  let i = r.get(rg, nl) || n === rn.ShadowDom,
    s = e.selectRootElement(t, i);
  return em(s), s;
}
function em(e) {
  tm(e);
}
var tm = () => null;
function nm(e, t, n, r) {
  let o = Ol(t);
  o.push(n), e.firstCreatePass && Fl(e).push(r, o.length - 1);
}
function rm(e, t, n, r, o, i) {
  let s = t ? t.injectorIndex : -1,
    a = 0;
  return (
    Sc() && (a |= 128),
    {
      type: n,
      index: r,
      insertBeforeIndex: null,
      injectorIndex: s,
      directiveStart: -1,
      directiveEnd: -1,
      directiveStylingLast: -1,
      componentOffset: -1,
      propertyBindings: null,
      flags: a,
      providerIndexes: 0,
      value: o,
      attrs: i,
      mergedAttrs: null,
      localNames: null,
      initialInputs: void 0,
      inputs: null,
      outputs: null,
      tView: null,
      next: null,
      prev: null,
      projectionNext: null,
      child: null,
      parent: t,
      projection: null,
      styles: null,
      stylesWithoutHost: null,
      residualStyles: void 0,
      classes: null,
      classesWithoutHost: null,
      residualClasses: void 0,
      classBindings: 0,
      styleBindings: 0,
    }
  );
}
function Cu(e, t, n, r, o) {
  for (let i in t) {
    if (!t.hasOwnProperty(i)) continue;
    let s = t[i];
    if (s === void 0) continue;
    r ??= {};
    let a,
      u = Le.None;
    Array.isArray(s) ? ((a = s[0]), (u = s[1])) : (a = s);
    let c = i;
    if (o !== null) {
      if (!o.hasOwnProperty(i)) continue;
      c = o[i];
    }
    e === 0 ? bu(r, n, c, a, u) : bu(r, n, c, a);
  }
  return r;
}
function bu(e, t, n, r, o) {
  let i;
  e.hasOwnProperty(n) ? (i = e[n]).push(t, r) : (i = e[n] = [t, r]),
    o !== void 0 && i.push(o);
}
function om(e, t, n) {
  let r = t.directiveStart,
    o = t.directiveEnd,
    i = e.data,
    s = t.attrs,
    a = [],
    u = null,
    c = null;
  for (let l = r; l < o; l++) {
    let d = i[l],
      h = n ? n.get(d) : null,
      f = h ? h.inputs : null,
      p = h ? h.outputs : null;
    (u = Cu(0, d.inputs, l, u, f)), (c = Cu(1, d.outputs, l, c, p));
    let g = u !== null && s !== null && !us(t) ? Im(u, l, s) : null;
    a.push(g);
  }
  u !== null &&
    (u.hasOwnProperty('class') && (t.flags |= 8),
    u.hasOwnProperty('style') && (t.flags |= 16)),
    (t.initialInputs = a),
    (t.inputs = u),
    (t.outputs = c);
}
function im(e) {
  return e === 'class'
    ? 'className'
    : e === 'for'
      ? 'htmlFor'
      : e === 'formaction'
        ? 'formAction'
        : e === 'innerHtml'
          ? 'innerHTML'
          : e === 'readonly'
            ? 'readOnly'
            : e === 'tabindex'
              ? 'tabIndex'
              : e;
}
function ro(e, t, n, r, o, i, s, a) {
  let u = ie(t, n),
    c = t.inputs,
    l;
  !a && c != null && (l = c[r])
    ? (Ls(e, n, l, r, o), Gr(t) && sm(n, t.index))
    : t.type & 3
      ? ((r = im(r)),
        (o = s != null ? s(o, t.value || '', r) : o),
        i.setProperty(u, r, o))
      : t.type & 12;
}
function sm(e, t) {
  let n = Ue(t, e);
  n[y] & 16 || (n[y] |= 64);
}
function ks(e, t, n, r) {
  if (xc()) {
    let o = r === null ? null : { '': -1 },
      i = dm(e, n),
      s,
      a;
    i === null ? (s = a = null) : ([s, a] = i),
      s !== null && Sl(e, t, n, s, o, a),
      o && fm(n, r, o);
  }
  n.mergedAttrs = on(n.mergedAttrs, n.attrs);
}
function Sl(e, t, n, r, o, i) {
  for (let c = 0; c < r.length; c++) li(br(n, t), e, r[c].type);
  pm(n, e.data.length, r.length);
  for (let c = 0; c < r.length; c++) {
    let l = r[c];
    l.providersResolver && l.providersResolver(l);
  }
  let s = !1,
    a = !1,
    u = _l(e, t, r.length, null);
  for (let c = 0; c < r.length; c++) {
    let l = r[c];
    (n.mergedAttrs = on(n.mergedAttrs, l.hostAttrs)),
      gm(e, n, t, u, l),
      hm(u, l, o),
      l.contentQueries !== null && (n.flags |= 4),
      (l.hostBindings !== null || l.hostAttrs !== null || l.hostVars !== 0) &&
        (n.flags |= 64);
    let d = l.type.prototype;
    !s &&
      (d.ngOnChanges || d.ngOnInit || d.ngDoCheck) &&
      ((e.preOrderHooks ??= []).push(n.index), (s = !0)),
      !a &&
        (d.ngOnChanges || d.ngDoCheck) &&
        ((e.preOrderCheckHooks ??= []).push(n.index), (a = !0)),
      u++;
  }
  om(e, n, i);
}
function am(e, t, n, r, o) {
  let i = o.hostBindings;
  if (i) {
    let s = e.hostBindingOpCodes;
    s === null && (s = e.hostBindingOpCodes = []);
    let a = ~t.index;
    um(s) != a && s.push(a), s.push(n, r, i);
  }
}
function um(e) {
  let t = e.length;
  for (; t > 0; ) {
    let n = e[--t];
    if (typeof n == 'number' && n < 0) return n;
  }
  return 0;
}
function cm(e, t, n, r) {
  let o = n.directiveStart,
    i = n.directiveEnd;
  Gr(n) && mm(t, n, e.data[o + n.componentOffset]),
    e.firstCreatePass || br(n, t),
    $e(r, t);
  let s = n.initialInputs;
  for (let a = o; a < i; a++) {
    let u = e.data[a],
      c = at(t, e, a, n);
    if (($e(c, t), s !== null && Dm(t, a - o, c, u, n, s), Me(u))) {
      let l = Ue(n.index, t);
      l[$] = at(t, e, a, n);
    }
  }
}
function Tl(e, t, n) {
  let r = n.directiveStart,
    o = n.directiveEnd,
    i = n.index,
    s = pp();
  try {
    it(i);
    for (let a = r; a < o; a++) {
      let u = e.data[a],
        c = t[a];
      ai(a),
        (u.hostBindings !== null || u.hostVars !== 0 || u.hostAttrs !== null) &&
          lm(u, c);
    }
  } finally {
    it(-1), ai(s);
  }
}
function lm(e, t) {
  e.hostBindings !== null && e.hostBindings(1, t);
}
function dm(e, t) {
  let n = e.directiveRegistry,
    r = null,
    o = null;
  if (n)
    for (let i = 0; i < n.length; i++) {
      let s = n[i];
      if (ec(t, s.selectors, !1))
        if ((r || (r = []), Me(s)))
          if (s.findHostDirectiveDefs !== null) {
            let a = [];
            (o = o || new Map()),
              s.findHostDirectiveDefs(s, a, o),
              r.unshift(...a, s);
            let u = a.length;
            xi(e, t, u);
          } else r.unshift(s), xi(e, t, 0);
        else
          (o = o || new Map()), s.findHostDirectiveDefs?.(s, r, o), r.push(s);
    }
  return r === null ? null : [r, o];
}
function xi(e, t, n) {
  (t.componentOffset = n), (e.components ??= []).push(t.index);
}
function fm(e, t, n) {
  if (t) {
    let r = (e.localNames = []);
    for (let o = 0; o < t.length; o += 2) {
      let i = n[t[o + 1]];
      if (i == null) throw new S(-301, !1);
      r.push(t[o], i);
    }
  }
}
function hm(e, t, n) {
  if (n) {
    if (t.exportAs)
      for (let r = 0; r < t.exportAs.length; r++) n[t.exportAs[r]] = e;
    Me(t) && (n[''] = e);
  }
}
function pm(e, t, n) {
  (e.flags |= 1),
    (e.directiveStart = t),
    (e.directiveEnd = t + n),
    (e.providerIndexes = t);
}
function gm(e, t, n, r, o) {
  e.data[r] = o;
  let i = o.factory || (o.factory = tt(o.type, !0)),
    s = new st(i, Me(o), Ut);
  (e.blueprint[r] = s), (n[r] = s), am(e, t, r, _l(e, n, o.hostVars, se), o);
}
function mm(e, t, n) {
  let r = ie(t, e),
    o = xl(n),
    i = e[ye].rendererFactory,
    s = 16;
  n.signals ? (s = 4096) : n.onPush && (s = 64);
  let a = oo(
    e,
    no(e, o, null, s, r, t, null, i.createRenderer(r, n), null, null, null)
  );
  e[t.index] = a;
}
function ym(e, t, n, r, o, i) {
  let s = ie(e, t);
  vm(t[R], s, i, e.value, n, r, o);
}
function vm(e, t, n, r, o, i, s) {
  if (i == null) e.removeAttribute(t, o, n);
  else {
    let a = s == null ? xt(i) : s(i, r || '', o);
    e.setAttribute(t, o, a, n);
  }
}
function Dm(e, t, n, r, o, i) {
  let s = i[t];
  if (s !== null)
    for (let a = 0; a < s.length; ) {
      let u = s[a++],
        c = s[a++],
        l = s[a++],
        d = s[a++];
      bl(r, n, u, c, l, d);
    }
}
function Im(e, t, n) {
  let r = null,
    o = 0;
  for (; o < n.length; ) {
    let i = n[o];
    if (i === 0) {
      o += 4;
      continue;
    } else if (i === 5) {
      o += 2;
      continue;
    }
    if (typeof i == 'number') break;
    if (e.hasOwnProperty(i)) {
      r === null && (r = []);
      let s = e[i];
      for (let a = 0; a < s.length; a += 3)
        if (s[a] === t) {
          r.push(i, s[a + 1], s[a + 2], n[o + 1]);
          break;
        }
    }
    o += 2;
  }
  return r;
}
function Nl(e, t, n, r) {
  return [e, !0, 0, t, null, r, null, n, null, null];
}
function Al(e, t) {
  let n = e.contentQueries;
  if (n !== null) {
    let r = b(null);
    try {
      for (let o = 0; o < n.length; o += 2) {
        let i = n[o],
          s = n[o + 1];
        if (s !== -1) {
          let a = e.data[s];
          Ds(i), a.contentQueries(2, t[s], s);
        }
      }
    } finally {
      b(r);
    }
  }
}
function oo(e, t) {
  return e[an] ? (e[iu][fe] = t) : (e[an] = t), (e[iu] = t), t;
}
function Si(e, t, n) {
  Ds(0);
  let r = b(null);
  try {
    t(e, n);
  } finally {
    b(r);
  }
}
function Ol(e) {
  return (e[vr] ??= []);
}
function Fl(e) {
  return (e.cleanup ??= []);
}
function Rl(e, t, n) {
  return (e === null || Me(e)) && (n = Kh(n[t.index])), n[R];
}
function Pl(e, t) {
  let n = e[At],
    r = n ? n.get(Ft, null) : null;
  r && r.handleError(t);
}
function Ls(e, t, n, r, o) {
  for (let i = 0; i < n.length; ) {
    let s = n[i++],
      a = n[i++],
      u = n[i++],
      c = t[s],
      l = e.data[s];
    bl(l, c, r, a, u, o);
  }
}
function kl(e, t, n) {
  let r = Ec(t, e);
  Fg(e[R], r, n);
}
function Em(e, t) {
  let n = Ue(t, e),
    r = n[v];
  wm(r, n);
  let o = n[De];
  o !== null && n[Nt] === null && (n[Nt] = xs(o, n[At])), js(r, n, n[$]);
}
function wm(e, t) {
  for (let n = t.length; n < e.blueprint.length; n++) t.push(e.blueprint[n]);
}
function js(e, t, n) {
  Is(t);
  try {
    let r = e.viewQuery;
    r !== null && Si(1, r, n);
    let o = e.template;
    o !== null && Ml(e, t, o, 1, n),
      e.firstCreatePass && (e.firstCreatePass = !1),
      t[_e]?.finishViewCreation(e),
      e.staticContentQueries && Al(e, t),
      e.staticViewQueries && Si(2, e.viewQuery, n);
    let i = e.components;
    i !== null && Cm(t, i);
  } catch (r) {
    throw (
      (e.firstCreatePass &&
        ((e.incompleteFirstPass = !0), (e.firstCreatePass = !1)),
      r)
    );
  } finally {
    (t[y] &= -5), Es();
  }
}
function Cm(e, t) {
  for (let n = 0; n < t.length; n++) Em(e, t[n]);
}
function yn(e, t, n, r) {
  let o = b(null);
  try {
    let i = t.tView,
      a = e[y] & 4096 ? 4096 : 16,
      u = no(
        e,
        i,
        n,
        a,
        null,
        t,
        null,
        null,
        r?.injector ?? null,
        r?.embeddedViewInjector ?? null,
        r?.dehydratedView ?? null
      ),
      c = e[t.index];
    u[nt] = c;
    let l = e[_e];
    return l !== null && (u[_e] = l.createEmbeddedView(i)), js(i, u, n), u;
  } finally {
    b(o);
  }
}
function Ll(e, t) {
  let n = H + t;
  if (n < e.length) return e[n];
}
function Rt(e, t) {
  return !t || t.firstChild === null || Kc(e);
}
function vn(e, t, n, r = !0) {
  let o = t[v];
  if ((jg(o, t, e, n), r)) {
    let s = Mi(n, e),
      a = t[R],
      u = yl(a, e[rt]);
    u !== null && kg(o, e[ee], a, t, u, s);
  }
  let i = t[Nt];
  i !== null && i.firstChild !== null && (i.firstChild = null);
}
function jl(e, t) {
  let n = cn(e, t);
  return n !== void 0 && Xr(n[v], n), n;
}
function Tr(e, t, n, r, o = !1) {
  for (; n !== null; ) {
    if (n.type === 128) {
      n = o ? n.projectionNext : n.next;
      continue;
    }
    let i = t[n.index];
    i !== null && r.push(ve(i)), Se(i) && bm(i, r);
    let s = n.type;
    if (s & 8) Tr(e, t, n.child, r);
    else if (s & 32) {
      let a = Ts(n, t),
        u;
      for (; (u = a()); ) r.push(u);
    } else if (s & 16) {
      let a = Dl(t, n);
      if (Array.isArray(a)) r.push(...a);
      else {
        let u = ot(t[te]);
        Tr(u[v], u, a, r, !0);
      }
    }
    n = o ? n.projectionNext : n.next;
  }
  return r;
}
function bm(e, t) {
  for (let n = H; n < e.length; n++) {
    let r = e[n],
      o = r[v].firstChild;
    o !== null && Tr(r[v], r, o, t);
  }
  e[rt] !== e[De] && t.push(e[rt]);
}
var Vl = [];
function _m(e) {
  return e[oe] ?? Mm(e);
}
function Mm(e) {
  let t = Vl.pop() ?? Object.create(Sm);
  return (t.lView = e), t;
}
function xm(e) {
  e.lView[oe] !== e && ((e.lView = null), Vl.push(e));
}
var Sm = Fe(Oe({}, Wt), {
  consumerIsAlwaysLive: !0,
  consumerMarkedDirty: (e) => {
    qr(e.lView);
  },
  consumerOnSignalRead() {
    this.lView[oe] = this;
  },
});
function Tm(e) {
  let t = e[oe] ?? Object.create(Nm);
  return (t.lView = e), t;
}
var Nm = Fe(Oe({}, Wt), {
  consumerIsAlwaysLive: !0,
  consumerMarkedDirty: (e) => {
    let t = ot(e.lView);
    for (; t && !Bl(t[v]); ) t = ot(t);
    t && bc(t);
  },
  consumerOnSignalRead() {
    this.lView[oe] = this;
  },
});
function Bl(e) {
  return e.type !== 2;
}
var Am = 100;
function $l(e, t = !0, n = 0) {
  let r = e[ye],
    o = r.rendererFactory,
    i = !1;
  i || o.begin?.();
  try {
    Om(e, n);
  } catch (s) {
    throw (t && Pl(e, s), s);
  } finally {
    i || (o.end?.(), r.inlineEffectRunner?.flush());
  }
}
function Om(e, t) {
  let n = Nc();
  try {
    au(!0), Ti(e, t);
    let r = 0;
    for (; un(e); ) {
      if (r === Am) throw new S(103, !1);
      r++, Ti(e, 1);
    }
  } finally {
    au(n);
  }
}
function Fm(e, t, n, r) {
  let o = t[y];
  if ((o & 256) === 256) return;
  let i = !1,
    s = !1;
  !i && t[ye].inlineEffectRunner?.flush(), Is(t);
  let a = !0,
    u = null,
    c = null;
  i ||
    (Bl(e)
      ? ((c = _m(t)), (u = Cn(c)))
      : aa() === null
        ? ((a = !1), (c = Tm(t)), (u = Cn(c)))
        : t[oe] && (vo(t[oe]), (t[oe] = null)));
  try {
    Cc(t), dp(e.bindingStartIndex), n !== null && Ml(e, t, n, 2, r);
    let l = (o & 3) === 3;
    if (!i)
      if (l) {
        let f = e.preOrderCheckHooks;
        f !== null && ar(t, f, null);
      } else {
        let f = e.preOrderHooks;
        f !== null && ur(t, f, 0, null), Vo(t, 0);
      }
    if ((s || Rm(t), Hl(t, 0), e.contentQueries !== null && Al(e, t), !i))
      if (l) {
        let f = e.contentCheckHooks;
        f !== null && ar(t, f);
      } else {
        let f = e.contentHooks;
        f !== null && ur(t, f, 1), Vo(t, 1);
      }
    Qg(e, t);
    let d = e.components;
    d !== null && zl(t, d, 0);
    let h = e.viewQuery;
    if ((h !== null && Si(2, h, r), !i))
      if (l) {
        let f = e.viewCheckHooks;
        f !== null && ar(t, f);
      } else {
        let f = e.viewHooks;
        f !== null && ur(t, f, 2), Vo(t, 2);
      }
    if ((e.firstUpdatePass === !0 && (e.firstUpdatePass = !1), t[jo])) {
      for (let f of t[jo]) f();
      t[jo] = null;
    }
    i || (t[y] &= -73);
  } catch (l) {
    throw (i || qr(t), l);
  } finally {
    c !== null && (mo(c, u), a && xm(c)), Es();
  }
}
function Hl(e, t) {
  for (let n = Xc(e); n !== null; n = el(n))
    for (let r = H; r < n.length; r++) {
      let o = n[r];
      Ul(o, t);
    }
}
function Rm(e) {
  for (let t = Xc(e); t !== null; t = el(t)) {
    if (!(t[y] & Ir.HasTransplantedViews)) continue;
    let n = t[Ot];
    for (let r = 0; r < n.length; r++) {
      let o = n[r];
      bc(o);
    }
  }
}
function Pm(e, t, n) {
  let r = Ue(t, e);
  Ul(r, n);
}
function Ul(e, t) {
  ps(e) && Ti(e, t);
}
function Ti(e, t) {
  let r = e[v],
    o = e[y],
    i = e[oe],
    s = !!(t === 0 && o & 16);
  if (
    ((s ||= !!(o & 64 && t === 0)),
    (s ||= !!(o & 1024)),
    (s ||= !!(i?.dirty && yo(i))),
    (s ||= !1),
    i && (i.dirty = !1),
    (e[y] &= -9217),
    s)
  )
    Fm(r, e, r.template, e[$]);
  else if (o & 8192) {
    Hl(e, 1);
    let a = r.components;
    a !== null && zl(e, a, 1);
  }
}
function zl(e, t, n) {
  for (let r = 0; r < t.length; r++) Pm(e, t[r], n);
}
function Vs(e, t) {
  let n = Nc() ? 64 : 1088;
  for (e[ye].changeDetectionScheduler?.notify(t); e; ) {
    e[y] |= n;
    let r = ot(e);
    if (oi(e) && !r) return e;
    e = r;
  }
  return null;
}
var ct = class {
    get rootNodes() {
      let t = this._lView,
        n = t[v];
      return Tr(n, t, n.firstChild, []);
    }
    constructor(t, n, r = !0) {
      (this._lView = t),
        (this._cdRefInjectingView = n),
        (this.notifyErrorHandler = r),
        (this._appRef = null),
        (this._attachedToViewContainer = !1);
    }
    get context() {
      return this._lView[$];
    }
    set context(t) {
      this._lView[$] = t;
    }
    get destroyed() {
      return (this._lView[y] & 256) === 256;
    }
    destroy() {
      if (this._appRef) this._appRef.detachView(this);
      else if (this._attachedToViewContainer) {
        let t = this._lView[z];
        if (Se(t)) {
          let n = t[Dr],
            r = n ? n.indexOf(this) : -1;
          r > -1 && (cn(t, r), gr(n, r));
        }
        this._attachedToViewContainer = !1;
      }
      Xr(this._lView[v], this._lView);
    }
    onDestroy(t) {
      _c(this._lView, t);
    }
    markForCheck() {
      Vs(this._cdRefInjectingView || this._lView, 4);
    }
    detach() {
      this._lView[y] &= -129;
    }
    reattach() {
      si(this._lView), (this._lView[y] |= 128);
    }
    detectChanges() {
      (this._lView[y] |= 1024), $l(this._lView, this.notifyErrorHandler);
    }
    checkNoChanges() {}
    attachToViewContainerRef() {
      if (this._appRef) throw new S(902, !1);
      this._attachedToViewContainer = !0;
    }
    detachFromAppRef() {
      this._appRef = null;
      let t = oi(this._lView),
        n = this._lView[nt];
      n !== null && !t && Ns(n, this._lView), hl(this._lView[v], this._lView);
    }
    attachToAppRef(t) {
      if (this._attachedToViewContainer) throw new S(902, !1);
      this._appRef = t;
      let n = oi(this._lView),
        r = this._lView[nt];
      r !== null && !n && pl(r, this._lView), si(this._lView);
    }
  },
  ln = (() => {
    let t = class t {};
    t.__NG_ELEMENT_ID__ = jm;
    let e = t;
    return e;
  })(),
  km = ln,
  Lm = class extends km {
    constructor(t, n, r) {
      super(),
        (this._declarationLView = t),
        (this._declarationTContainer = n),
        (this.elementRef = r);
    }
    get ssrId() {
      return this._declarationTContainer.tView?.ssrId || null;
    }
    createEmbeddedView(t, n) {
      return this.createEmbeddedViewImpl(t, n);
    }
    createEmbeddedViewImpl(t, n, r) {
      let o = yn(this._declarationLView, this._declarationTContainer, t, {
        embeddedViewInjector: n,
        dehydratedView: r,
      });
      return new ct(o);
    }
  };
function jm() {
  return Bs(V(), E());
}
function Bs(e, t) {
  return e.type & 4 ? new Lm(t, e, $t(e, t)) : null;
}
var a0 = new RegExp(`^(\\d+)*(${tg}|${eg})*(.*)`);
var Vm = () => null;
function Pt(e, t) {
  return Vm(e, t);
}
var kt = class {},
  $s = new A('', { providedIn: 'root', factory: () => !1 });
var Gl = new A(''),
  Ni = class {},
  Nr = class {};
function Bm(e) {
  let t = Error(`No component factory found for ${J(e)}.`);
  return (t[$m] = e), t;
}
var $m = 'ngComponent';
var Ai = class {
    resolveComponentFactory(t) {
      throw Bm(t);
    }
  },
  Ys = class Ys {};
Ys.NULL = new Ai();
var Lt = Ys,
  Ar = class {},
  Wl = (() => {
    let t = class t {
      constructor() {
        this.destroyNode = null;
      }
    };
    t.__NG_ELEMENT_ID__ = () => Hm();
    let e = t;
    return e;
  })();
function Hm() {
  let e = E(),
    t = V(),
    n = Ue(t.index, e);
  return (ke(n) ? n : e)[R];
}
var Um = (() => {
  let t = class t {};
  t.ɵprov = P({ token: t, providedIn: 'root', factory: () => null });
  let e = t;
  return e;
})();
var _u = new Set();
function Ge(e) {
  _u.has(e) ||
    (_u.add(e),
    performance?.mark?.('mark_feature_usage', { detail: { feature: e } }));
}
var K = (function (e) {
    return (
      (e[(e.EarlyRead = 0)] = 'EarlyRead'),
      (e[(e.Write = 1)] = 'Write'),
      (e[(e.MixedReadWrite = 2)] = 'MixedReadWrite'),
      (e[(e.Read = 3)] = 'Read'),
      e
    );
  })(K || {}),
  zm = { destroy() {} };
function Gm(e, t) {
  !t && Gh(Gm);
  let n = t?.injector ?? x(ut);
  return Ng(n)
    ? (Ge('NgAfterNextRender'), qm(e, n, !0, t?.phase ?? K.MixedReadWrite))
    : zm;
}
function Wm(e, t) {
  if (e instanceof Function)
    switch (t) {
      case K.EarlyRead:
        return { earlyRead: e };
      case K.Write:
        return { write: e };
      case K.MixedReadWrite:
        return { mixedReadWrite: e };
      case K.Read:
        return { read: e };
    }
  return e;
}
function qm(e, t, n, r) {
  let o = Wm(e, r),
    i = t.get(Hs),
    s = (i.handler ??= new Fi()),
    a = [],
    u = [],
    c = () => {
      for (let f of u) s.unregister(f);
      l();
    },
    l = t.get(Cs).onDestroy(c),
    d = 0,
    h = (f, p) => {
      if (!p) return;
      let g = n ? (...C) => (d--, d < 1 && c(), p(...C)) : p,
        T = zh(t, () => new Oi(f, a, g));
      s.register(T), u.push(T), d++;
    };
  return (
    h(K.EarlyRead, o.earlyRead),
    h(K.Write, o.write),
    h(K.MixedReadWrite, o.mixedReadWrite),
    h(K.Read, o.read),
    { destroy: c }
  );
}
var Oi = class {
    constructor(t, n, r) {
      (this.phase = t),
        (this.pipelinedArgs = n),
        (this.callbackFn = r),
        (this.zone = x(X)),
        (this.errorHandler = x(Ft, { optional: !0 })),
        x(kt, { optional: !0 })?.notify(6);
    }
    invoke() {
      try {
        let t = this.zone.runOutsideAngular(() =>
          this.callbackFn.apply(null, this.pipelinedArgs)
        );
        this.pipelinedArgs.splice(0, this.pipelinedArgs.length, t);
      } catch (t) {
        this.errorHandler?.handleError(t);
      }
    }
  },
  Fi = class {
    constructor() {
      (this.executingCallbacks = !1),
        (this.buckets = {
          [K.EarlyRead]: new Set(),
          [K.Write]: new Set(),
          [K.MixedReadWrite]: new Set(),
          [K.Read]: new Set(),
        }),
        (this.deferredCallbacks = new Set());
    }
    register(t) {
      (this.executingCallbacks
        ? this.deferredCallbacks
        : this.buckets[t.phase]
      ).add(t);
    }
    unregister(t) {
      this.buckets[t.phase].delete(t), this.deferredCallbacks.delete(t);
    }
    execute() {
      this.executingCallbacks = !0;
      for (let t of Object.values(this.buckets)) for (let n of t) n.invoke();
      this.executingCallbacks = !1;
      for (let t of this.deferredCallbacks) this.buckets[t.phase].add(t);
      this.deferredCallbacks.clear();
    }
    destroy() {
      for (let t of Object.values(this.buckets)) t.clear();
      this.deferredCallbacks.clear();
    }
  },
  Hs = (() => {
    let t = class t {
      constructor() {
        (this.handler = null), (this.internalCallbacks = []);
      }
      execute() {
        this.executeInternalCallbacks(), this.handler?.execute();
      }
      executeInternalCallbacks() {
        let r = [...this.internalCallbacks];
        this.internalCallbacks.length = 0;
        for (let o of r) o();
      }
      ngOnDestroy() {
        this.handler?.destroy(),
          (this.handler = null),
          (this.internalCallbacks.length = 0);
      }
    };
    t.ɵprov = P({ token: t, providedIn: 'root', factory: () => new t() });
    let e = t;
    return e;
  })();
function Or(e, t, n) {
  let r = n ? e.styles : null,
    o = n ? e.classes : null,
    i = 0;
  if (t !== null)
    for (let s = 0; s < t.length; s++) {
      let a = t[s];
      if (typeof a == 'number') i = a;
      else if (i == 1) o = Qo(o, a);
      else if (i == 2) {
        let u = a,
          c = t[++s];
        r = Qo(r, u + ': ' + c + ';');
      }
    }
  n ? (e.styles = r) : (e.stylesWithoutHost = r),
    n ? (e.classes = o) : (e.classesWithoutHost = o);
}
var Fr = class extends Lt {
  constructor(t) {
    super(), (this.ngModule = t);
  }
  resolveComponentFactory(t) {
    let n = je(t);
    return new jt(n, this.ngModule);
  }
};
function Mu(e, t) {
  let n = [];
  for (let r in e) {
    if (!e.hasOwnProperty(r)) continue;
    let o = e[r];
    if (o === void 0) continue;
    let i = Array.isArray(o),
      s = i ? o[0] : o,
      a = i ? o[1] : Le.None;
    t
      ? n.push({
          propName: s,
          templateName: r,
          isSignal: (a & Le.SignalBased) !== 0,
        })
      : n.push({ propName: s, templateName: r });
  }
  return n;
}
function Zm(e) {
  let t = e.toLowerCase();
  return t === 'svg' ? Ic : t === 'math' ? Qh : null;
}
var jt = class extends Nr {
    get inputs() {
      let t = this.componentDef,
        n = t.inputTransforms,
        r = Mu(t.inputs, !0);
      if (n !== null)
        for (let o of r)
          n.hasOwnProperty(o.propName) && (o.transform = n[o.propName]);
      return r;
    }
    get outputs() {
      return Mu(this.componentDef.outputs, !1);
    }
    constructor(t, n) {
      super(),
        (this.componentDef = t),
        (this.ngModule = n),
        (this.componentType = t.type),
        (this.selector = _h(t.selectors)),
        (this.ngContentSelectors = t.ngContentSelectors
          ? t.ngContentSelectors
          : []),
        (this.isBoundToModule = !!n);
    }
    create(t, n, r, o) {
      let i = b(null);
      try {
        o = o || this.ngModule;
        let s = o instanceof Ve ? o : o?.injector;
        s &&
          this.componentDef.getStandaloneInjector !== null &&
          (s = this.componentDef.getStandaloneInjector(s) || s);
        let a = s ? new ui(t, s) : t,
          u = a.get(Ar, null);
        if (u === null) throw new S(407, !1);
        let c = a.get(Um, null),
          l = a.get(Hs, null),
          d = a.get(kt, null),
          h = {
            rendererFactory: u,
            sanitizer: c,
            inlineEffectRunner: null,
            afterRenderEventManager: l,
            changeDetectionScheduler: d,
          },
          f = u.createRenderer(null, this.componentDef),
          p = this.componentDef.selectors[0][0] || 'div',
          g = r
            ? Xg(f, r, this.componentDef.encapsulation, a)
            : fl(f, p, Zm(p)),
          T = 512;
        this.componentDef.signals
          ? (T |= 4096)
          : this.componentDef.onPush || (T |= 16);
        let C = null;
        g !== null && (C = xs(g, a, !0));
        let j = Ps(0, null, null, 1, 0, null, null, null, null, null, null),
          q = no(null, j, null, T, null, null, h, f, a, null, C);
        Is(q);
        let Ie, ht;
        try {
          let ae = this.componentDef,
            pt,
            co = null;
          ae.findHostDirectiveDefs
            ? ((pt = []),
              (co = new Map()),
              ae.findHostDirectiveDefs(ae, pt, co),
              pt.push(ae))
            : (pt = [ae]);
          let xd = Ym(q, g),
            Sd = Qm(xd, g, ae, pt, q, h, f);
          (ht = hs(j, B)),
            g && Xm(f, ae, g, r),
            n !== void 0 && ey(ht, this.ngContentSelectors, n),
            (Ie = Jm(Sd, ae, pt, co, q, [ty])),
            js(j, q, null);
        } finally {
          Es();
        }
        return new Ri(this.componentType, Ie, $t(ht, q), q, ht);
      } finally {
        b(i);
      }
    }
  },
  Ri = class extends Ni {
    constructor(t, n, r, o, i) {
      super(),
        (this.location = r),
        (this._rootLView = o),
        (this._tNode = i),
        (this.previousInputValues = null),
        (this.instance = n),
        (this.hostView = this.changeDetectorRef = new ct(o, void 0, !1)),
        (this.componentType = t);
    }
    setInput(t, n) {
      let r = this._tNode.inputs,
        o;
      if (r !== null && (o = r[t])) {
        if (
          ((this.previousInputValues ??= new Map()),
          this.previousInputValues.has(t) &&
            Object.is(this.previousInputValues.get(t), n))
        )
          return;
        let i = this._rootLView;
        Ls(i[v], i, o, t, n), this.previousInputValues.set(t, n);
        let s = Ue(this._tNode.index, i);
        Vs(s, 1);
      }
    }
    get injector() {
      return new et(this._tNode, this._rootLView);
    }
    destroy() {
      this.hostView.destroy();
    }
    onDestroy(t) {
      this.hostView.onDestroy(t);
    }
  };
function Ym(e, t) {
  let n = e[v],
    r = B;
  return (e[r] = t), zt(n, r, 2, '#host', null);
}
function Qm(e, t, n, r, o, i, s) {
  let a = o[v];
  Km(r, e, t, s);
  let u = null;
  t !== null && (u = xs(t, o[At]));
  let c = i.rendererFactory.createRenderer(t, n),
    l = 16;
  n.signals ? (l = 4096) : n.onPush && (l = 64);
  let d = no(o, xl(n), null, l, o[e.index], e, i, c, null, null, u);
  return (
    a.firstCreatePass && xi(a, e, r.length - 1), oo(o, d), (o[e.index] = d)
  );
}
function Km(e, t, n, r) {
  for (let o of e) t.mergedAttrs = on(t.mergedAttrs, o.hostAttrs);
  t.mergedAttrs !== null &&
    (Or(t, t.mergedAttrs, !0), n !== null && wl(r, n, t));
}
function Jm(e, t, n, r, o, i) {
  let s = V(),
    a = o[v],
    u = ie(s, o);
  Sl(a, o, s, n, null, r);
  for (let l = 0; l < n.length; l++) {
    let d = s.directiveStart + l,
      h = at(o, a, d, s);
    $e(h, o);
  }
  Tl(a, o, s), u && $e(u, o);
  let c = at(o, a, s.directiveStart + s.componentOffset, s);
  if (((e[$] = o[$] = c), i !== null)) for (let l of i) l(c, t);
  return Os(a, s, o), c;
}
function Xm(e, t, n, r) {
  if (r) ei(e, n, ['ng-version', '18.2.0']);
  else {
    let { attrs: o, classes: i } = Mh(t.selectors[0]);
    o && ei(e, n, o), i && i.length > 0 && El(e, n, i.join(' '));
  }
}
function ey(e, t, n) {
  let r = (e.projection = []);
  for (let o = 0; o < t.length; o++) {
    let i = n[o];
    r.push(i != null ? Array.from(i) : null);
  }
}
function ty() {
  let e = V();
  Qr(E()[v], e);
}
var io = (() => {
  let t = class t {};
  t.__NG_ELEMENT_ID__ = ny;
  let e = t;
  return e;
})();
function ny() {
  let e = V();
  return Zl(e, E());
}
var ry = io,
  ql = class extends ry {
    constructor(t, n, r) {
      super(),
        (this._lContainer = t),
        (this._hostTNode = n),
        (this._hostLView = r);
    }
    get element() {
      return $t(this._hostTNode, this._hostLView);
    }
    get injector() {
      return new et(this._hostTNode, this._hostLView);
    }
    get parentInjector() {
      let t = ws(this._hostTNode, this._hostLView);
      if (Vc(t)) {
        let n = wr(t, this._hostLView),
          r = Er(t),
          o = n[v].data[r + 8];
        return new et(o, n);
      } else return new et(null, this._hostLView);
    }
    clear() {
      for (; this.length > 0; ) this.remove(this.length - 1);
    }
    get(t) {
      let n = xu(this._lContainer);
      return (n !== null && n[t]) || null;
    }
    get length() {
      return this._lContainer.length - H;
    }
    createEmbeddedView(t, n, r) {
      let o, i;
      typeof r == 'number'
        ? (o = r)
        : r != null && ((o = r.index), (i = r.injector));
      let s = Pt(this._lContainer, t.ssrId),
        a = t.createEmbeddedViewImpl(n || {}, i, s);
      return this.insertImpl(a, o, Rt(this._hostTNode, s)), a;
    }
    createComponent(t, n, r, o, i) {
      let s = t && !Wh(t),
        a;
      if (s) a = n;
      else {
        let p = n || {};
        (a = p.index),
          (r = p.injector),
          (o = p.projectableNodes),
          (i = p.environmentInjector || p.ngModuleRef);
      }
      let u = s ? t : new jt(je(t)),
        c = r || this.parentInjector;
      if (!i && u.ngModule == null) {
        let g = (s ? c : this.parentInjector).get(Ve, null);
        g && (i = g);
      }
      let l = je(u.componentType ?? {}),
        d = Pt(this._lContainer, l?.id ?? null),
        h = d?.firstChild ?? null,
        f = u.create(c, o, h, i);
      return this.insertImpl(f.hostView, a, Rt(this._hostTNode, d)), f;
    }
    insert(t, n) {
      return this.insertImpl(t, n, !0);
    }
    insertImpl(t, n, r) {
      let o = t._lView;
      if (Xh(o)) {
        let a = this.indexOf(t);
        if (a !== -1) this.detach(a);
        else {
          let u = o[z],
            c = new ql(u, u[ee], u[z]);
          c.detach(c.indexOf(t));
        }
      }
      let i = this._adjustIndex(n),
        s = this._lContainer;
      return vn(s, o, i, r), t.attachToViewContainerRef(), Zu(zo(s), i, t), t;
    }
    move(t, n) {
      return this.insert(t, n);
    }
    indexOf(t) {
      let n = xu(this._lContainer);
      return n !== null ? n.indexOf(t) : -1;
    }
    remove(t) {
      let n = this._adjustIndex(t, -1),
        r = cn(this._lContainer, n);
      r && (gr(zo(this._lContainer), n), Xr(r[v], r));
    }
    detach(t) {
      let n = this._adjustIndex(t, -1),
        r = cn(this._lContainer, n);
      return r && gr(zo(this._lContainer), n) != null ? new ct(r) : null;
    }
    _adjustIndex(t, n = 0) {
      return t ?? this.length + n;
    }
  };
function xu(e) {
  return e[Dr];
}
function zo(e) {
  return e[Dr] || (e[Dr] = []);
}
function Zl(e, t) {
  let n,
    r = t[e.index];
  return (
    Se(r) ? (n = r) : ((n = Nl(r, t, null, e)), (t[e.index] = n), oo(t, n)),
    iy(n, t, e, r),
    new ql(n, e, t)
  );
}
function oy(e, t) {
  let n = e[R],
    r = n.createComment(''),
    o = ie(t, e),
    i = yl(n, o);
  return Sr(n, i, r, Hg(n, o), !1), r;
}
var iy = uy,
  sy = () => !1;
function ay(e, t, n) {
  return sy(e, t, n);
}
function uy(e, t, n, r) {
  if (e[rt]) return;
  let o;
  n.type & 8 ? (o = ve(r)) : (o = oy(t, n)), (e[rt] = o);
}
var Pi = class e {
    constructor(t) {
      (this.queryList = t), (this.matches = null);
    }
    clone() {
      return new e(this.queryList);
    }
    setDirty() {
      this.queryList.setDirty();
    }
  },
  ki = class e {
    constructor(t = []) {
      this.queries = t;
    }
    createEmbeddedView(t) {
      let n = t.queries;
      if (n !== null) {
        let r = t.contentQueries !== null ? t.contentQueries[0] : n.length,
          o = [];
        for (let i = 0; i < r; i++) {
          let s = n.getByIndex(i),
            a = this.queries[s.indexInDeclarationView];
          o.push(a.clone());
        }
        return new e(o);
      }
      return null;
    }
    insertView(t) {
      this.dirtyQueriesWithMatches(t);
    }
    detachView(t) {
      this.dirtyQueriesWithMatches(t);
    }
    finishViewCreation(t) {
      this.dirtyQueriesWithMatches(t);
    }
    dirtyQueriesWithMatches(t) {
      for (let n = 0; n < this.queries.length; n++)
        Us(t, n).matches !== null && this.queries[n].setDirty();
    }
  },
  Rr = class {
    constructor(t, n, r = null) {
      (this.flags = n),
        (this.read = r),
        typeof t == 'string' ? (this.predicate = my(t)) : (this.predicate = t);
    }
  },
  Li = class e {
    constructor(t = []) {
      this.queries = t;
    }
    elementStart(t, n) {
      for (let r = 0; r < this.queries.length; r++)
        this.queries[r].elementStart(t, n);
    }
    elementEnd(t) {
      for (let n = 0; n < this.queries.length; n++)
        this.queries[n].elementEnd(t);
    }
    embeddedTView(t) {
      let n = null;
      for (let r = 0; r < this.length; r++) {
        let o = n !== null ? n.length : 0,
          i = this.getByIndex(r).embeddedTView(t, o);
        i &&
          ((i.indexInDeclarationView = r), n !== null ? n.push(i) : (n = [i]));
      }
      return n !== null ? new e(n) : null;
    }
    template(t, n) {
      for (let r = 0; r < this.queries.length; r++)
        this.queries[r].template(t, n);
    }
    getByIndex(t) {
      return this.queries[t];
    }
    get length() {
      return this.queries.length;
    }
    track(t) {
      this.queries.push(t);
    }
  },
  ji = class e {
    constructor(t, n = -1) {
      (this.metadata = t),
        (this.matches = null),
        (this.indexInDeclarationView = -1),
        (this.crossesNgTemplate = !1),
        (this._appliesToNextNode = !0),
        (this._declarationNodeIndex = n);
    }
    elementStart(t, n) {
      this.isApplyingToNode(n) && this.matchTNode(t, n);
    }
    elementEnd(t) {
      this._declarationNodeIndex === t.index && (this._appliesToNextNode = !1);
    }
    template(t, n) {
      this.elementStart(t, n);
    }
    embeddedTView(t, n) {
      return this.isApplyingToNode(t)
        ? ((this.crossesNgTemplate = !0),
          this.addMatch(-t.index, n),
          new e(this.metadata))
        : null;
    }
    isApplyingToNode(t) {
      if (this._appliesToNextNode && (this.metadata.flags & 1) !== 1) {
        let n = this._declarationNodeIndex,
          r = t.parent;
        for (; r !== null && r.type & 8 && r.index !== n; ) r = r.parent;
        return n === (r !== null ? r.index : -1);
      }
      return this._appliesToNextNode;
    }
    matchTNode(t, n) {
      let r = this.metadata.predicate;
      if (Array.isArray(r))
        for (let o = 0; o < r.length; o++) {
          let i = r[o];
          this.matchTNodeWithReadOption(t, n, cy(n, i)),
            this.matchTNodeWithReadOption(t, n, cr(n, t, i, !1, !1));
        }
      else
        r === ln
          ? n.type & 4 && this.matchTNodeWithReadOption(t, n, -1)
          : this.matchTNodeWithReadOption(t, n, cr(n, t, r, !1, !1));
    }
    matchTNodeWithReadOption(t, n, r) {
      if (r !== null) {
        let o = this.metadata.read;
        if (o !== null)
          if (o === Ht || o === io || (o === ln && n.type & 4))
            this.addMatch(n.index, -2);
          else {
            let i = cr(n, t, o, !1, !1);
            i !== null && this.addMatch(n.index, i);
          }
        else this.addMatch(n.index, r);
      }
    }
    addMatch(t, n) {
      this.matches === null ? (this.matches = [t, n]) : this.matches.push(t, n);
    }
  };
function cy(e, t) {
  let n = e.localNames;
  if (n !== null) {
    for (let r = 0; r < n.length; r += 2) if (n[r] === t) return n[r + 1];
  }
  return null;
}
function ly(e, t) {
  return e.type & 11 ? $t(e, t) : e.type & 4 ? Bs(e, t) : null;
}
function dy(e, t, n, r) {
  return n === -1 ? ly(t, e) : n === -2 ? fy(e, t, r) : at(e, e[v], n, t);
}
function fy(e, t, n) {
  if (n === Ht) return $t(t, e);
  if (n === ln) return Bs(t, e);
  if (n === io) return Zl(t, e);
}
function Yl(e, t, n, r) {
  let o = t[_e].queries[r];
  if (o.matches === null) {
    let i = e.data,
      s = n.matches,
      a = [];
    for (let u = 0; s !== null && u < s.length; u += 2) {
      let c = s[u];
      if (c < 0) a.push(null);
      else {
        let l = i[c];
        a.push(dy(t, l, s[u + 1], n.metadata.read));
      }
    }
    o.matches = a;
  }
  return o.matches;
}
function Vi(e, t, n, r) {
  let o = e.queries.getByIndex(n),
    i = o.matches;
  if (i !== null) {
    let s = Yl(e, t, o, n);
    for (let a = 0; a < i.length; a += 2) {
      let u = i[a];
      if (u > 0) r.push(s[a / 2]);
      else {
        let c = i[a + 1],
          l = t[-u];
        for (let d = H; d < l.length; d++) {
          let h = l[d];
          h[nt] === h[z] && Vi(h[v], h, c, r);
        }
        if (l[Ot] !== null) {
          let d = l[Ot];
          for (let h = 0; h < d.length; h++) {
            let f = d[h];
            Vi(f[v], f, c, r);
          }
        }
      }
    }
  }
  return r;
}
function hy(e, t) {
  return e[_e].queries[t].queryList;
}
function Ql(e, t, n) {
  let r = new mi((n & 4) === 4);
  return (
    nm(e, t, r, r.destroy), (t[_e] ??= new ki()).queries.push(new Pi(r)) - 1
  );
}
function py(e, t, n) {
  let r = F();
  return (
    r.firstCreatePass &&
      (Kl(r, new Rr(e, t, n), -1), (t & 2) === 2 && (r.staticViewQueries = !0)),
    Ql(r, E(), t)
  );
}
function gy(e, t, n, r) {
  let o = F();
  if (o.firstCreatePass) {
    let i = V();
    Kl(o, new Rr(t, n, r), i.index),
      yy(o, e),
      (n & 2) === 2 && (o.staticContentQueries = !0);
  }
  return Ql(o, E(), n);
}
function my(e) {
  return e.split(',').map((t) => t.trim());
}
function Kl(e, t, n) {
  e.queries === null && (e.queries = new Li()), e.queries.track(new ji(t, n));
}
function yy(e, t) {
  let n = e.contentQueries || (e.contentQueries = []),
    r = n.length ? n[n.length - 1] : -1;
  t !== r && n.push(e.queries.length - 1, t);
}
function Us(e, t) {
  return e.queries.getByIndex(t);
}
function vy(e, t) {
  let n = e[v],
    r = Us(n, t);
  return r.crossesNgTemplate ? Vi(n, e, t, []) : Yl(n, e, r, t);
}
function Dy(e) {
  return typeof e == 'function' && e[Ee] !== void 0;
}
function c0(e, t) {
  Ge('NgSignals');
  let n = va(e),
    r = n[Ee];
  return (
    t?.equal && (r.equal = t.equal),
    (n.set = (o) => Do(r, o)),
    (n.update = (o) => Da(r, o)),
    (n.asReadonly = Iy.bind(n)),
    n
  );
}
function Iy() {
  let e = this[Ee];
  if (e.readonlyFn === void 0) {
    let t = () => this();
    (t[Ee] = e), (e.readonlyFn = t);
  }
  return e.readonlyFn;
}
function Jl(e) {
  return Dy(e) && typeof e.set == 'function';
}
function Ey(e) {
  return Object.getPrototypeOf(e.prototype).constructor;
}
function wy(e) {
  let t = Ey(e.type),
    n = !0,
    r = [e];
  for (; t; ) {
    let o;
    if (Me(e)) o = t.ɵcmp || t.ɵdir;
    else {
      if (t.ɵcmp) throw new S(903, !1);
      o = t.ɵdir;
    }
    if (o) {
      if (n) {
        r.push(o);
        let s = e;
        (s.inputs = rr(e.inputs)),
          (s.inputTransforms = rr(e.inputTransforms)),
          (s.declaredInputs = rr(e.declaredInputs)),
          (s.outputs = rr(e.outputs));
        let a = o.hostBindings;
        a && xy(e, a);
        let u = o.viewQuery,
          c = o.contentQueries;
        if (
          (u && _y(e, u),
          c && My(e, c),
          Cy(e, o),
          Hf(e.outputs, o.outputs),
          Me(o) && o.data.animation)
        ) {
          let l = e.data;
          l.animation = (l.animation || []).concat(o.data.animation);
        }
      }
      let i = o.features;
      if (i)
        for (let s = 0; s < i.length; s++) {
          let a = i[s];
          a && a.ngInherit && a(e), a === wy && (n = !1);
        }
    }
    t = Object.getPrototypeOf(t);
  }
  by(r);
}
function Cy(e, t) {
  for (let n in t.inputs) {
    if (!t.inputs.hasOwnProperty(n) || e.inputs.hasOwnProperty(n)) continue;
    let r = t.inputs[n];
    if (
      r !== void 0 &&
      ((e.inputs[n] = r),
      (e.declaredInputs[n] = t.declaredInputs[n]),
      t.inputTransforms !== null)
    ) {
      let o = Array.isArray(r) ? r[0] : r;
      if (!t.inputTransforms.hasOwnProperty(o)) continue;
      (e.inputTransforms ??= {}), (e.inputTransforms[o] = t.inputTransforms[o]);
    }
  }
}
function by(e) {
  let t = 0,
    n = null;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e[r];
    (o.hostVars = t += o.hostVars),
      (o.hostAttrs = on(o.hostAttrs, (n = on(n, o.hostAttrs))));
  }
}
function rr(e) {
  return e === St ? {} : e === Q ? [] : e;
}
function _y(e, t) {
  let n = e.viewQuery;
  n
    ? (e.viewQuery = (r, o) => {
        t(r, o), n(r, o);
      })
    : (e.viewQuery = t);
}
function My(e, t) {
  let n = e.contentQueries;
  n
    ? (e.contentQueries = (r, o, i) => {
        t(r, o, i), n(r, o, i);
      })
    : (e.contentQueries = t);
}
function xy(e, t) {
  let n = e.hostBindings;
  n
    ? (e.hostBindings = (r, o) => {
        t(r, o), n(r, o);
      })
    : (e.hostBindings = t);
}
function Sy(e) {
  let t = e.inputConfig,
    n = {};
  for (let r in t)
    if (t.hasOwnProperty(r)) {
      let o = t[r];
      Array.isArray(o) && o[3] && (n[r] = o[3]);
    }
  e.inputTransforms = n;
}
var He = class {},
  Bi = class {};
var $i = class extends He {
    constructor(t, n, r, o = !0) {
      super(),
        (this.ngModuleType = t),
        (this._parent = n),
        (this._bootstrapComponents = []),
        (this.destroyCbs = []),
        (this.componentFactoryResolver = new Fr(this));
      let i = ic(t);
      (this._bootstrapComponents = dl(i.bootstrap)),
        (this._r3Injector = Zc(
          t,
          n,
          [
            { provide: He, useValue: this },
            { provide: Lt, useValue: this.componentFactoryResolver },
            ...r,
          ],
          J(t),
          new Set(['environment'])
        )),
        o && this.resolveInjectorInitializers();
    }
    resolveInjectorInitializers() {
      this._r3Injector.resolveInjectorInitializers(),
        (this.instance = this._r3Injector.get(this.ngModuleType));
    }
    get injector() {
      return this._r3Injector;
    }
    destroy() {
      let t = this._r3Injector;
      !t.destroyed && t.destroy(),
        this.destroyCbs.forEach((n) => n()),
        (this.destroyCbs = null);
    }
    onDestroy(t) {
      this.destroyCbs.push(t);
    }
  },
  Hi = class extends Bi {
    constructor(t) {
      super(), (this.moduleType = t);
    }
    create(t) {
      return new $i(this.moduleType, t, []);
    }
  };
var Pr = class extends He {
  constructor(t) {
    super(),
      (this.componentFactoryResolver = new Fr(this)),
      (this.instance = null);
    let n = new sn(
      [
        ...t.providers,
        { provide: He, useValue: this },
        { provide: Lt, useValue: this.componentFactoryResolver },
      ],
      t.parent || ls(),
      t.debugName,
      new Set(['environment'])
    );
    (this.injector = n),
      t.runEnvironmentInitializers && n.resolveInjectorInitializers();
  }
  destroy() {
    this.injector.destroy();
  }
  onDestroy(t) {
    this.injector.onDestroy(t);
  }
};
function Ty(e, t, n = null) {
  return new Pr({
    providers: e,
    parent: t,
    debugName: n,
    runEnvironmentInitializers: !0,
  }).injector;
}
function Xl(e) {
  return Ay(e)
    ? Array.isArray(e) || (!(e instanceof Map) && Symbol.iterator in e)
    : !1;
}
function Ny(e, t) {
  if (Array.isArray(e)) for (let n = 0; n < e.length; n++) t(e[n]);
  else {
    let n = e[Symbol.iterator](),
      r;
    for (; !(r = n.next()).done; ) t(r.value);
  }
}
function Ay(e) {
  return e !== null && (typeof e == 'function' || typeof e == 'object');
}
function Oy(e, t, n) {
  return (e[t] = n);
}
function ne(e, t, n) {
  let r = e[t];
  return Object.is(r, n) ? !1 : ((e[t] = n), !0);
}
function Fy(e, t, n, r) {
  let o = ne(e, t, n);
  return ne(e, t + 1, r) || o;
}
function Ry(e) {
  return (e.flags & 32) === 32;
}
function Py(e, t, n, r, o, i, s, a, u) {
  let c = t.consts,
    l = zt(t, e, 4, s || null, a || null);
  ks(t, n, l, Be(c, u)), Qr(t, l);
  let d = (l.tView = Ps(
    2,
    l,
    r,
    o,
    i,
    t.directiveRegistry,
    t.pipeRegistry,
    null,
    t.schemas,
    c,
    null
  ));
  return (
    t.queries !== null &&
      (t.queries.template(t, l), (d.queries = t.queries.embeddedTView(l))),
    l
  );
}
function kr(e, t, n, r, o, i, s, a, u, c) {
  let l = n + B,
    d = t.firstCreatePass ? Py(l, t, e, r, o, i, s, a, u) : t.data[l];
  dt(d, !1);
  let h = Ly(t, e, d, n);
  Zr() && eo(t, e, h, d), $e(h, e);
  let f = Nl(h, e, h, d);
  return (
    (e[l] = f),
    oo(e, f),
    ay(f, d, e),
    Wr(d) && Fs(t, e, d),
    u != null && Rs(e, d, c),
    d
  );
}
function ky(e, t, n, r, o, i, s, a) {
  let u = E(),
    c = F(),
    l = Be(c.consts, i);
  return kr(u, c, e, t, n, r, o, l, s, a), ky;
}
var Ly = jy;
function jy(e, t, n, r) {
  return Yr(!0), t[R].createComment('');
}
function Vy(e, t, n, r) {
  let o = E(),
    i = ze();
  if (ne(o, i, t)) {
    let s = F(),
      a = pn();
    ym(a, o, e, t, n, r);
  }
  return Vy;
}
function By(e, t, n, r) {
  return ne(e, ze(), n) ? t + xt(n) + r : se;
}
function $y(e, t, n, r, o, i) {
  let s = lp(),
    a = Fy(e, s, n, o);
  return ys(2), a ? t + xt(n) + r + xt(o) + i : se;
}
function or(e, t) {
  return (e << 17) | (t << 2);
}
function lt(e) {
  return (e >> 17) & 32767;
}
function Hy(e) {
  return (e & 2) == 2;
}
function Uy(e, t) {
  return (e & 131071) | (t << 17);
}
function Ui(e) {
  return e | 2;
}
function Vt(e) {
  return (e & 131068) >> 2;
}
function Go(e, t) {
  return (e & -131069) | (t << 2);
}
function zy(e) {
  return (e & 1) === 1;
}
function zi(e) {
  return e | 1;
}
function Gy(e, t, n, r, o, i) {
  let s = i ? t.classBindings : t.styleBindings,
    a = lt(s),
    u = Vt(s);
  e[r] = n;
  let c = !1,
    l;
  if (Array.isArray(n)) {
    let d = n;
    (l = d[1]), (l === null || hn(d, l) > 0) && (c = !0);
  } else l = n;
  if (o)
    if (u !== 0) {
      let h = lt(e[a + 1]);
      (e[r + 1] = or(h, a)),
        h !== 0 && (e[h + 1] = Go(e[h + 1], r)),
        (e[a + 1] = Uy(e[a + 1], r));
    } else
      (e[r + 1] = or(a, 0)), a !== 0 && (e[a + 1] = Go(e[a + 1], r)), (a = r);
  else
    (e[r + 1] = or(u, 0)),
      a === 0 ? (a = r) : (e[u + 1] = Go(e[u + 1], r)),
      (u = r);
  c && (e[r + 1] = Ui(e[r + 1])),
    Su(e, l, r, !0),
    Su(e, l, r, !1),
    Wy(t, l, e, r, i),
    (s = or(a, u)),
    i ? (t.classBindings = s) : (t.styleBindings = s);
}
function Wy(e, t, n, r, o) {
  let i = o ? e.residualClasses : e.residualStyles;
  i != null &&
    typeof t == 'string' &&
    hn(i, t) >= 0 &&
    (n[r + 1] = zi(n[r + 1]));
}
function Su(e, t, n, r) {
  let o = e[n + 1],
    i = t === null,
    s = r ? lt(o) : Vt(o),
    a = !1;
  for (; s !== 0 && (a === !1 || i); ) {
    let u = e[s],
      c = e[s + 1];
    qy(u, t) && ((a = !0), (e[s + 1] = r ? zi(c) : Ui(c))),
      (s = r ? lt(c) : Vt(c));
  }
  a && (e[n + 1] = r ? Ui(o) : zi(o));
}
function qy(e, t) {
  return e === null || t == null || (Array.isArray(e) ? e[1] : e) === t
    ? !0
    : Array.isArray(e) && typeof t == 'string'
      ? hn(e, t) >= 0
      : !1;
}
var le = { textEnd: 0, key: 0, keyEnd: 0, value: 0, valueEnd: 0 };
function Zy(e) {
  return e.substring(le.key, le.keyEnd);
}
function Yy(e) {
  return Qy(e), ed(e, td(e, 0, le.textEnd));
}
function ed(e, t) {
  let n = le.textEnd;
  return n === t ? -1 : ((t = le.keyEnd = Ky(e, (le.key = t), n)), td(e, t, n));
}
function Qy(e) {
  (le.key = 0),
    (le.keyEnd = 0),
    (le.value = 0),
    (le.valueEnd = 0),
    (le.textEnd = e.length);
}
function td(e, t, n) {
  for (; t < n && e.charCodeAt(t) <= 32; ) t++;
  return t;
}
function Ky(e, t, n) {
  for (; t < n && e.charCodeAt(t) > 32; ) t++;
  return t;
}
function Jy(e, t, n) {
  let r = E(),
    o = ze();
  if (ne(r, o, t)) {
    let i = F(),
      s = pn();
    ro(i, s, r, e, t, r[R], n, !1);
  }
  return Jy;
}
function Gi(e, t, n, r, o) {
  let i = t.inputs,
    s = o ? 'class' : 'style';
  Ls(e, n, i[s], s, r);
}
function nd(e, t, n) {
  return rd(e, t, n, !1), nd;
}
function Xy(e, t) {
  return rd(e, t, null, !0), Xy;
}
function l0(e) {
  tv(av, ev, e, !0);
}
function ev(e, t) {
  for (let n = Yy(t); n >= 0; n = ed(t, n)) as(e, Zy(t), !0);
}
function rd(e, t, n, r) {
  let o = E(),
    i = F(),
    s = ys(2);
  if ((i.firstUpdatePass && id(i, e, s, r), t !== se && ne(o, s, t))) {
    let a = i.data[Te()];
    sd(i, a, o, o[R], e, (o[s + 1] = cv(t, n)), r, s);
  }
}
function tv(e, t, n, r) {
  let o = F(),
    i = ys(2);
  o.firstUpdatePass && id(o, null, i, r);
  let s = E();
  if (n !== se && ne(s, i, n)) {
    let a = o.data[Te()];
    if (ad(a, r) && !od(o, i)) {
      let u = r ? a.classesWithoutHost : a.stylesWithoutHost;
      u !== null && (n = Qo(u, n || '')), Gi(o, a, s, n, r);
    } else uv(o, a, s, s[R], s[i + 1], (s[i + 1] = sv(e, t, n)), r, i);
  }
}
function od(e, t) {
  return t >= e.expandoStartIndex;
}
function id(e, t, n, r) {
  let o = e.data;
  if (o[n + 1] === null) {
    let i = o[Te()],
      s = od(e, n);
    ad(i, r) && t === null && !s && (t = !1),
      (t = nv(o, i, t, r)),
      Gy(o, i, t, n, s, r);
  }
}
function nv(e, t, n, r) {
  let o = vs(e),
    i = r ? t.residualClasses : t.residualStyles;
  if (o === null)
    (r ? t.classBindings : t.styleBindings) === 0 &&
      ((n = Wo(null, e, t, n, r)), (n = dn(n, t.attrs, r)), (i = null));
  else {
    let s = t.directiveStylingLast;
    if (s === -1 || e[s] !== o)
      if (((n = Wo(o, e, t, n, r)), i === null)) {
        let u = rv(e, t, r);
        u !== void 0 &&
          Array.isArray(u) &&
          ((u = Wo(null, e, t, u[1], r)),
          (u = dn(u, t.attrs, r)),
          ov(e, t, r, u));
      } else i = iv(e, t, r);
  }
  return (
    i !== void 0 && (r ? (t.residualClasses = i) : (t.residualStyles = i)), n
  );
}
function rv(e, t, n) {
  let r = n ? t.classBindings : t.styleBindings;
  if (Vt(r) !== 0) return e[lt(r)];
}
function ov(e, t, n, r) {
  let o = n ? t.classBindings : t.styleBindings;
  e[lt(o)] = r;
}
function iv(e, t, n) {
  let r,
    o = t.directiveEnd;
  for (let i = 1 + t.directiveStylingLast; i < o; i++) {
    let s = e[i].hostAttrs;
    r = dn(r, s, n);
  }
  return dn(r, t.attrs, n);
}
function Wo(e, t, n, r, o) {
  let i = null,
    s = n.directiveEnd,
    a = n.directiveStylingLast;
  for (
    a === -1 ? (a = n.directiveStart) : a++;
    a < s && ((i = t[a]), (r = dn(r, i.hostAttrs, o)), i !== e);

  )
    a++;
  return e !== null && (n.directiveStylingLast = a), r;
}
function dn(e, t, n) {
  let r = n ? 1 : 2,
    o = -1;
  if (t !== null)
    for (let i = 0; i < t.length; i++) {
      let s = t[i];
      typeof s == 'number'
        ? (o = s)
        : o === r &&
          (Array.isArray(e) || (e = e === void 0 ? [] : ['', e]),
          as(e, s, n ? !0 : t[++i]));
    }
  return e === void 0 ? null : e;
}
function sv(e, t, n) {
  if (n == null || n === '') return Q;
  let r = [],
    o = gn(n);
  if (Array.isArray(o)) for (let i = 0; i < o.length; i++) e(r, o[i], !0);
  else if (typeof o == 'object')
    for (let i in o) o.hasOwnProperty(i) && e(r, i, o[i]);
  else typeof o == 'string' && t(r, o);
  return r;
}
function av(e, t, n) {
  let r = String(t);
  r !== '' && !r.includes(' ') && as(e, r, n);
}
function uv(e, t, n, r, o, i, s, a) {
  o === se && (o = Q);
  let u = 0,
    c = 0,
    l = 0 < o.length ? o[0] : null,
    d = 0 < i.length ? i[0] : null;
  for (; l !== null || d !== null; ) {
    let h = u < o.length ? o[u + 1] : void 0,
      f = c < i.length ? i[c + 1] : void 0,
      p = null,
      g;
    l === d
      ? ((u += 2), (c += 2), h !== f && ((p = d), (g = f)))
      : d === null || (l !== null && l < d)
        ? ((u += 2), (p = l))
        : ((c += 2), (p = d), (g = f)),
      p !== null && sd(e, t, n, r, p, g, s, a),
      (l = u < o.length ? o[u] : null),
      (d = c < i.length ? i[c] : null);
  }
}
function sd(e, t, n, r, o, i, s, a) {
  if (!(t.type & 3)) return;
  let u = e.data,
    c = u[a + 1],
    l = zy(c) ? Tu(u, t, n, o, Vt(c), s) : void 0;
  if (!Lr(l)) {
    Lr(i) || (Hy(c) && (i = Tu(u, null, n, o, a, s)));
    let d = Ec(Te(), n);
    Zg(r, s, d, o, i);
  }
}
function Tu(e, t, n, r, o, i) {
  let s = t === null,
    a;
  for (; o > 0; ) {
    let u = e[o],
      c = Array.isArray(u),
      l = c ? u[1] : u,
      d = l === null,
      h = n[o + 1];
    h === se && (h = d ? Q : void 0);
    let f = d ? ko(h, r) : l === r ? h : void 0;
    if ((c && !Lr(f) && (f = ko(u, r)), Lr(f) && ((a = f), s))) return a;
    let p = e[o + 1];
    o = s ? lt(p) : Vt(p);
  }
  if (t !== null) {
    let u = i ? t.residualClasses : t.residualStyles;
    u != null && (a = ko(u, r));
  }
  return a;
}
function Lr(e) {
  return e !== void 0;
}
function cv(e, t) {
  return (
    e == null ||
      e === '' ||
      (typeof t == 'string'
        ? (e = e + t)
        : typeof e == 'object' && (e = J(gn(e)))),
    e
  );
}
function ad(e, t) {
  return (e.flags & (t ? 8 : 16)) !== 0;
}
var Wi = class {
  destroy(t) {}
  updateValue(t, n) {}
  swap(t, n) {
    let r = Math.min(t, n),
      o = Math.max(t, n),
      i = this.detach(o);
    if (o - r > 1) {
      let s = this.detach(r);
      this.attach(r, i), this.attach(o, s);
    } else this.attach(r, i);
  }
  move(t, n) {
    this.attach(n, this.detach(t));
  }
};
function qo(e, t, n, r, o) {
  return e === n && Object.is(t, r) ? 1 : Object.is(o(e, t), o(n, r)) ? -1 : 0;
}
function lv(e, t, n) {
  let r,
    o,
    i = 0,
    s = e.length - 1,
    a = void 0;
  if (Array.isArray(t)) {
    let u = t.length - 1;
    for (; i <= s && i <= u; ) {
      let c = e.at(i),
        l = t[i],
        d = qo(i, c, i, l, n);
      if (d !== 0) {
        d < 0 && e.updateValue(i, l), i++;
        continue;
      }
      let h = e.at(s),
        f = t[u],
        p = qo(s, h, u, f, n);
      if (p !== 0) {
        p < 0 && e.updateValue(s, f), s--, u--;
        continue;
      }
      let g = n(i, c),
        T = n(s, h),
        C = n(i, l);
      if (Object.is(C, T)) {
        let j = n(u, f);
        Object.is(j, g)
          ? (e.swap(i, s), e.updateValue(s, f), u--, s--)
          : e.move(s, i),
          e.updateValue(i, l),
          i++;
        continue;
      }
      if (((r ??= new jr()), (o ??= Au(e, i, s, n)), qi(e, r, i, C)))
        e.updateValue(i, l), i++, s++;
      else if (o.has(C)) r.set(g, e.detach(i)), s--;
      else {
        let j = e.create(i, t[i]);
        e.attach(i, j), i++, s++;
      }
    }
    for (; i <= u; ) Nu(e, r, n, i, t[i]), i++;
  } else if (t != null) {
    let u = t[Symbol.iterator](),
      c = u.next();
    for (; !c.done && i <= s; ) {
      let l = e.at(i),
        d = c.value,
        h = qo(i, l, i, d, n);
      if (h !== 0) h < 0 && e.updateValue(i, d), i++, (c = u.next());
      else {
        (r ??= new jr()), (o ??= Au(e, i, s, n));
        let f = n(i, d);
        if (qi(e, r, i, f)) e.updateValue(i, d), i++, s++, (c = u.next());
        else if (!o.has(f))
          e.attach(i, e.create(i, d)), i++, s++, (c = u.next());
        else {
          let p = n(i, l);
          r.set(p, e.detach(i)), s--;
        }
      }
    }
    for (; !c.done; ) Nu(e, r, n, e.length, c.value), (c = u.next());
  }
  for (; i <= s; ) e.destroy(e.detach(s--));
  r?.forEach((u) => {
    e.destroy(u);
  });
}
function qi(e, t, n, r) {
  return t !== void 0 && t.has(r)
    ? (e.attach(n, t.get(r)), t.delete(r), !0)
    : !1;
}
function Nu(e, t, n, r, o) {
  if (qi(e, t, r, n(r, o))) e.updateValue(r, o);
  else {
    let i = e.create(r, o);
    e.attach(r, i);
  }
}
function Au(e, t, n, r) {
  let o = new Set();
  for (let i = t; i <= n; i++) o.add(r(i, e.at(i)));
  return o;
}
var jr = class {
  constructor() {
    (this.kvMap = new Map()), (this._vMap = void 0);
  }
  has(t) {
    return this.kvMap.has(t);
  }
  delete(t) {
    if (!this.has(t)) return !1;
    let n = this.kvMap.get(t);
    return (
      this._vMap !== void 0 && this._vMap.has(n)
        ? (this.kvMap.set(t, this._vMap.get(n)), this._vMap.delete(n))
        : this.kvMap.delete(t),
      !0
    );
  }
  get(t) {
    return this.kvMap.get(t);
  }
  set(t, n) {
    if (this.kvMap.has(t)) {
      let r = this.kvMap.get(t);
      this._vMap === void 0 && (this._vMap = new Map());
      let o = this._vMap;
      for (; o.has(r); ) r = o.get(r);
      o.set(r, n);
    } else this.kvMap.set(t, n);
  }
  forEach(t) {
    for (let [n, r] of this.kvMap)
      if ((t(r, n), this._vMap !== void 0)) {
        let o = this._vMap;
        for (; o.has(r); ) (r = o.get(r)), t(r, n);
      }
  }
};
function d0(e, t) {
  Ge('NgControlFlow');
  let n = E(),
    r = ze(),
    o = n[r] !== se ? n[r] : -1,
    i = o !== -1 ? Vr(n, B + o) : void 0,
    s = 0;
  if (ne(n, r, e)) {
    let a = b(null);
    try {
      if ((i !== void 0 && jl(i, s), e !== -1)) {
        let u = B + e,
          c = Vr(n, u),
          l = Ki(n[v], u),
          d = Pt(c, l.tView.ssrId),
          h = yn(n, l, t, { dehydratedView: d });
        vn(c, h, s, Rt(l, d));
      }
    } finally {
      b(a);
    }
  } else if (i !== void 0) {
    let a = Ll(i, s);
    a !== void 0 && (a[$] = t);
  }
}
var Zi = class {
  constructor(t, n, r) {
    (this.lContainer = t), (this.$implicit = n), (this.$index = r);
  }
  get $count() {
    return this.lContainer.length - H;
  }
};
function f0(e, t) {
  return t;
}
var Yi = class {
  constructor(t, n, r) {
    (this.hasEmptyBlock = t), (this.trackByFn = n), (this.liveCollection = r);
  }
};
function h0(e, t, n, r, o, i, s, a, u, c, l, d, h) {
  Ge('NgControlFlow');
  let f = E(),
    p = F(),
    g = u !== void 0,
    T = E(),
    C = a ? s.bind(T[te][$]) : s,
    j = new Yi(g, C);
  (T[B + e] = j),
    kr(f, p, e + 1, t, n, r, o, Be(p.consts, i)),
    g && kr(f, p, e + 2, u, c, l, d, Be(p.consts, h));
}
var Qi = class extends Wi {
  constructor(t, n, r) {
    super(),
      (this.lContainer = t),
      (this.hostLView = n),
      (this.templateTNode = r),
      (this.operationsCounter = void 0),
      (this.needsIndexUpdate = !1);
  }
  get length() {
    return this.lContainer.length - H;
  }
  at(t) {
    return this.getLView(t)[$].$implicit;
  }
  attach(t, n) {
    let r = n[Nt];
    (this.needsIndexUpdate ||= t !== this.length),
      vn(this.lContainer, n, t, Rt(this.templateTNode, r));
  }
  detach(t) {
    return (
      (this.needsIndexUpdate ||= t !== this.length - 1), dv(this.lContainer, t)
    );
  }
  create(t, n) {
    let r = Pt(this.lContainer, this.templateTNode.tView.ssrId),
      o = yn(
        this.hostLView,
        this.templateTNode,
        new Zi(this.lContainer, n, t),
        { dehydratedView: r }
      );
    return this.operationsCounter?.recordCreate(), o;
  }
  destroy(t) {
    Xr(t[v], t), this.operationsCounter?.recordDestroy();
  }
  updateValue(t, n) {
    this.getLView(t)[$].$implicit = n;
  }
  reset() {
    (this.needsIndexUpdate = !1), this.operationsCounter?.reset();
  }
  updateIndexes() {
    if (this.needsIndexUpdate)
      for (let t = 0; t < this.length; t++) this.getLView(t)[$].$index = t;
  }
  getLView(t) {
    return fv(this.lContainer, t);
  }
};
function p0(e) {
  let t = b(null),
    n = Te();
  try {
    let r = E(),
      o = r[v],
      i = r[n],
      s = n + 1,
      a = Vr(r, s);
    if (i.liveCollection === void 0) {
      let c = Ki(o, s);
      i.liveCollection = new Qi(a, r, c);
    } else i.liveCollection.reset();
    let u = i.liveCollection;
    if ((lv(u, e, i.trackByFn), u.updateIndexes(), i.hasEmptyBlock)) {
      let c = ze(),
        l = u.length === 0;
      if (ne(r, c, l)) {
        let d = n + 2,
          h = Vr(r, d);
        if (l) {
          let f = Ki(o, d),
            p = Pt(h, f.tView.ssrId),
            g = yn(r, f, void 0, { dehydratedView: p });
          vn(h, g, 0, Rt(f, p));
        } else jl(h, 0);
      }
    }
  } finally {
    b(t);
  }
}
function Vr(e, t) {
  return e[t];
}
function dv(e, t) {
  return cn(e, t);
}
function fv(e, t) {
  return Ll(e, t);
}
function Ki(e, t) {
  return hs(e, t);
}
function hv(e, t, n, r, o, i) {
  let s = t.consts,
    a = Be(s, o),
    u = zt(t, e, 2, r, a);
  return (
    ks(t, n, u, Be(s, i)),
    u.attrs !== null && Or(u, u.attrs, !1),
    u.mergedAttrs !== null && Or(u, u.mergedAttrs, !0),
    t.queries !== null && t.queries.elementStart(t, u),
    u
  );
}
function ud(e, t, n, r) {
  let o = E(),
    i = F(),
    s = B + e,
    a = o[R],
    u = i.firstCreatePass ? hv(s, i, o, t, n, r) : i.data[s],
    c = gv(i, o, u, a, t, e);
  o[s] = c;
  let l = Wr(u);
  return (
    dt(u, !0),
    wl(a, c, u),
    !Ry(u) && Zr() && eo(i, o, c, u),
    np() === 0 && $e(c, o),
    rp(),
    l && (Fs(i, o, u), Os(i, u, o)),
    r !== null && Rs(o, u),
    ud
  );
}
function cd() {
  let e = V();
  gs() ? ms() : ((e = e.parent), dt(e, !1));
  let t = e;
  ip(t) && sp(), op();
  let n = F();
  return (
    n.firstCreatePass && (Qr(n, e), fs(e) && n.queries.elementEnd(e)),
    t.classesWithoutHost != null &&
      wp(t) &&
      Gi(n, t, E(), t.classesWithoutHost, !0),
    t.stylesWithoutHost != null &&
      Cp(t) &&
      Gi(n, t, E(), t.stylesWithoutHost, !1),
    cd
  );
}
function pv(e, t, n, r) {
  return ud(e, t, n, r), cd(), pv;
}
var gv = (e, t, n, r, o, i) => (Yr(!0), fl(r, o, vp()));
function mv(e, t, n, r, o) {
  let i = t.consts,
    s = Be(i, r),
    a = zt(t, e, 8, 'ng-container', s);
  s !== null && Or(a, s, !0);
  let u = Be(i, o);
  return ks(t, n, a, u), t.queries !== null && t.queries.elementStart(t, a), a;
}
function ld(e, t, n) {
  let r = E(),
    o = F(),
    i = e + B,
    s = o.firstCreatePass ? mv(i, o, r, t, n) : o.data[i];
  dt(s, !0);
  let a = vv(o, r, s, e);
  return (
    (r[i] = a),
    Zr() && eo(o, r, a, s),
    $e(a, r),
    Wr(s) && (Fs(o, r, s), Os(o, s, r)),
    n != null && Rs(r, s),
    ld
  );
}
function dd() {
  let e = V(),
    t = F();
  return (
    gs() ? ms() : ((e = e.parent), dt(e, !1)),
    t.firstCreatePass && (Qr(t, e), fs(e) && t.queries.elementEnd(e)),
    dd
  );
}
function yv(e, t, n) {
  return ld(e, t, n), dd(), yv;
}
var vv = (e, t, n, r) => (Yr(!0), Rg(t[R], ''));
function g0() {
  return E();
}
function Dv(e, t, n) {
  let r = E(),
    o = ze();
  if (ne(r, o, t)) {
    let i = F(),
      s = pn();
    ro(i, s, r, e, t, r[R], n, !0);
  }
  return Dv;
}
function Iv(e, t, n) {
  let r = E(),
    o = ze();
  if (ne(r, o, t)) {
    let i = F(),
      s = pn(),
      a = vs(i.data),
      u = Rl(a, s, r);
    ro(i, s, r, e, t, u, n, !0);
  }
  return Iv;
}
var Br = 'en-US';
var Ev = Br;
function wv(e) {
  typeof e == 'string' && (Ev = e.toLowerCase().replace(/_/g, '-'));
}
var Cv = (e, t, n) => {};
function bv(e, t, n, r) {
  let o = E(),
    i = F(),
    s = V();
  return zs(i, o, o[R], s, e, t, r), bv;
}
function _v(e, t) {
  let n = V(),
    r = E(),
    o = F(),
    i = vs(o.data),
    s = Rl(i, n, r);
  return zs(o, r, s, n, e, t), _v;
}
function Mv(e, t, n, r) {
  let o = e.cleanup;
  if (o != null)
    for (let i = 0; i < o.length - 1; i += 2) {
      let s = o[i];
      if (s === n && o[i + 1] === r) {
        let a = t[vr],
          u = o[i + 2];
        return a.length > u ? a[u] : null;
      }
      typeof s == 'string' && (i += 2);
    }
  return null;
}
function zs(e, t, n, r, o, i, s) {
  let a = Wr(r),
    c = e.firstCreatePass && Fl(e),
    l = t[$],
    d = Ol(t),
    h = !0;
  if (r.type & 3 || s) {
    let g = ie(r, t),
      T = s ? s(g) : g,
      C = d.length,
      j = s ? (Ie) => s(ve(Ie[r.index])) : r.index,
      q = null;
    if ((!s && a && (q = Mv(e, t, o, r.index)), q !== null)) {
      let Ie = q.__ngLastListenerFn__ || q;
      (Ie.__ngNextListenerFn__ = i), (q.__ngLastListenerFn__ = i), (h = !1);
    } else {
      (i = Fu(r, t, l, i)), Cv(g, o, i);
      let Ie = n.listen(T, o, i);
      d.push(i, Ie), c && c.push(o, j, C, C + 1);
    }
  } else i = Fu(r, t, l, i);
  let f = r.outputs,
    p;
  if (h && f !== null && (p = f[o])) {
    let g = p.length;
    if (g)
      for (let T = 0; T < g; T += 2) {
        let C = p[T],
          j = p[T + 1],
          ht = t[C][j].subscribe(i),
          ae = d.length;
        d.push(i, ht), c && c.push(o, r.index, ae, -(ae + 1));
      }
  }
}
function Ou(e, t, n, r) {
  let o = b(null);
  try {
    return ge(6, t, n), n(r) !== !1;
  } catch (i) {
    return Pl(e, i), !1;
  } finally {
    ge(7, t, n), b(o);
  }
}
function Fu(e, t, n, r) {
  return function o(i) {
    if (i === Function) return r;
    let s = e.componentOffset > -1 ? Ue(e.index, t) : t;
    Vs(s, 5);
    let a = Ou(t, n, r, i),
      u = o.__ngNextListenerFn__;
    for (; u; ) (a = Ou(t, n, u, i) && a), (u = u.__ngNextListenerFn__);
    return a;
  };
}
function m0(e = 1) {
  return mp(e);
}
function xv(e, t) {
  let n = null,
    r = Ih(e);
  for (let o = 0; o < t.length; o++) {
    let i = t[o];
    if (i === '*') {
      n = o;
      continue;
    }
    if (r === null ? ec(e, i, !0) : Ch(r, i)) return o;
  }
  return n;
}
function y0(e) {
  let t = E()[te][ee];
  if (!t.projection) {
    let n = e ? e.length : 1,
      r = (t.projection = dh(n, null)),
      o = r.slice(),
      i = t.child;
    for (; i !== null; ) {
      if (i.type !== 128) {
        let s = e ? xv(i, e) : 0;
        s !== null &&
          (o[s] ? (o[s].projectionNext = i) : (r[s] = i), (o[s] = i));
      }
      i = i.next;
    }
  }
}
function v0(e, t = 0, n, r, o, i) {
  let s = E(),
    a = F(),
    u = r ? e + 1 : null;
  u !== null && kr(s, a, u, r, o, i, null, n);
  let c = zt(a, B + e, 16, null, n || null);
  c.projection === null && (c.projection = t), ms();
  let d = !s[Nt] || Sc();
  s[te][ee].projection[c.projection] === null && u !== null
    ? Sv(s, a, u)
    : d && (c.flags & 32) !== 32 && Wg(a, s, c);
}
function Sv(e, t, n) {
  let r = B + n,
    o = t.data[r],
    i = e[r],
    s = Pt(i, o.tView.ssrId),
    a = yn(e, o, void 0, { dehydratedView: s });
  vn(i, a, 0, Rt(o, s));
}
function D0(e, t, n, r) {
  gy(e, t, n, r);
}
function I0(e, t, n) {
  py(e, t, n);
}
function E0(e) {
  let t = E(),
    n = F(),
    r = Ac();
  Ds(r + 1);
  let o = Us(n, r);
  if (e.dirty && Jh(t) === ((o.metadata.flags & 2) === 2)) {
    if (o.matches === null) e.reset([]);
    else {
      let i = vy(t, r);
      e.reset(i, Gp), e.notifyOnChanges();
    }
    return !0;
  }
  return !1;
}
function w0() {
  return hy(E(), Ac());
}
function Tv(e, t, n, r) {
  n >= e.data.length && ((e.data[n] = null), (e.blueprint[n] = null)),
    (t[n] = r);
}
function C0(e) {
  let t = up();
  return wc(t, B + e);
}
function b0(e, t = '') {
  let n = E(),
    r = F(),
    o = e + B,
    i = r.firstCreatePass ? zt(r, o, 1, t, null) : r.data[o],
    s = Nv(r, n, i, t, e);
  (n[o] = s), Zr() && eo(r, n, s, i), dt(i, !1);
}
var Nv = (e, t, n, r, o) => (Yr(!0), Og(t[R], r));
function Av(e) {
  return fd('', e, ''), Av;
}
function fd(e, t, n) {
  let r = E(),
    o = By(r, e, t, n);
  return o !== se && kl(r, Te(), o), fd;
}
function Ov(e, t, n, r, o) {
  let i = E(),
    s = $y(i, e, t, n, r, o);
  return s !== se && kl(i, Te(), s), Ov;
}
function Fv(e, t, n) {
  Jl(t) && (t = t());
  let r = E(),
    o = ze();
  if (ne(r, o, t)) {
    let i = F(),
      s = pn();
    ro(i, s, r, e, t, r[R], n, !1);
  }
  return Fv;
}
function _0(e, t) {
  let n = Jl(e);
  return n && e.set(t), n;
}
function Rv(e, t) {
  let n = E(),
    r = F(),
    o = V();
  return zs(r, n, n[R], o, e, t), Rv;
}
function Pv(e, t, n) {
  let r = F();
  if (r.firstCreatePass) {
    let o = Me(e);
    Ji(n, r.data, r.blueprint, o, !0), Ji(t, r.data, r.blueprint, o, !1);
  }
}
function Ji(e, t, n, r, o) {
  if (((e = W(e)), Array.isArray(e)))
    for (let i = 0; i < e.length; i++) Ji(e[i], t, n, r, o);
  else {
    let i = F(),
      s = E(),
      a = V(),
      u = Tt(e) ? e : W(e.provide),
      c = fc(e),
      l = a.providerIndexes & 1048575,
      d = a.directiveStart,
      h = a.providerIndexes >> 20;
    if (Tt(e) || !e.multi) {
      let f = new st(c, o, Ut),
        p = Yo(u, t, o ? l : l + h, d);
      p === -1
        ? (li(br(a, s), i, u),
          Zo(i, e, t.length),
          t.push(u),
          a.directiveStart++,
          a.directiveEnd++,
          o && (a.providerIndexes += 1048576),
          n.push(f),
          s.push(f))
        : ((n[p] = f), (s[p] = f));
    } else {
      let f = Yo(u, t, l + h, d),
        p = Yo(u, t, l, l + h),
        g = f >= 0 && n[f],
        T = p >= 0 && n[p];
      if ((o && !T) || (!o && !g)) {
        li(br(a, s), i, u);
        let C = jv(o ? Lv : kv, n.length, o, r, c);
        !o && T && (n[p].providerFactory = C),
          Zo(i, e, t.length, 0),
          t.push(u),
          a.directiveStart++,
          a.directiveEnd++,
          o && (a.providerIndexes += 1048576),
          n.push(C),
          s.push(C);
      } else {
        let C = hd(n[o ? p : f], c, !o && r);
        Zo(i, e, f > -1 ? f : p, C);
      }
      !o && r && T && n[p].componentProviders++;
    }
  }
}
function Zo(e, t, n, r) {
  let o = Tt(t),
    i = Lh(t);
  if (o || i) {
    let u = (i ? W(t.useClass) : t).prototype.ngOnDestroy;
    if (u) {
      let c = e.destroyHooks || (e.destroyHooks = []);
      if (!o && t.multi) {
        let l = c.indexOf(n);
        l === -1 ? c.push(n, [r, u]) : c[l + 1].push(r, u);
      } else c.push(n, u);
    }
  }
}
function hd(e, t, n) {
  return n && e.componentProviders++, e.multi.push(t) - 1;
}
function Yo(e, t, n, r) {
  for (let o = n; o < r; o++) if (t[o] === e) return o;
  return -1;
}
function kv(e, t, n, r) {
  return Xi(this.multi, []);
}
function Lv(e, t, n, r) {
  let o = this.multi,
    i;
  if (this.providerFactory) {
    let s = this.providerFactory.componentProviders,
      a = at(n, n[v], this.providerFactory.index, r);
    (i = a.slice(0, s)), Xi(o, i);
    for (let u = s; u < a.length; u++) i.push(a[u]);
  } else (i = []), Xi(o, i);
  return i;
}
function Xi(e, t) {
  for (let n = 0; n < e.length; n++) {
    let r = e[n];
    t.push(r());
  }
  return t;
}
function jv(e, t, n, r, o) {
  let i = new st(e, n, Ut);
  return (
    (i.multi = []),
    (i.index = t),
    (i.componentProviders = 0),
    hd(i, o, r && !n),
    i
  );
}
function M0(e, t = []) {
  return (n) => {
    n.providersResolver = (r, o) => Pv(r, o ? o(e) : e, t);
  };
}
var Vv = (() => {
  let t = class t {
    constructor(r) {
      (this._injector = r), (this.cachedInjectors = new Map());
    }
    getOrCreateStandaloneInjector(r) {
      if (!r.standalone) return null;
      if (!this.cachedInjectors.has(r)) {
        let o = uc(!1, r.type),
          i =
            o.length > 0
              ? Ty([o], this._injector, `Standalone[${r.type.name}]`)
              : null;
        this.cachedInjectors.set(r, i);
      }
      return this.cachedInjectors.get(r);
    }
    ngOnDestroy() {
      try {
        for (let r of this.cachedInjectors.values()) r !== null && r.destroy();
      } finally {
        this.cachedInjectors.clear();
      }
    }
  };
  t.ɵprov = P({
    token: t,
    providedIn: 'environment',
    factory: () => new t(U(Ve)),
  });
  let e = t;
  return e;
})();
function x0(e) {
  Ge('NgStandalone'),
    (e.getStandaloneInjector = (t) =>
      t.get(Vv).getOrCreateStandaloneInjector(e));
}
function Bv(e, t) {
  let n = e[t];
  return n === se ? void 0 : n;
}
function $v(e, t, n, r, o, i) {
  let s = t + n;
  return ne(e, s, o) ? Oy(e, s + 1, i ? r.call(i, o) : r(o)) : Bv(e, s + 1);
}
function S0(e, t) {
  let n = F(),
    r,
    o = e + B;
  n.firstCreatePass
    ? ((r = Hv(t, n.pipeRegistry)),
      (n.data[o] = r),
      r.onDestroy && (n.destroyHooks ??= []).push(o, r.onDestroy))
    : (r = n.data[o]);
  let i = r.factory || (r.factory = tt(r.type, !0)),
    s,
    a = Y(Ut);
  try {
    let u = Cr(!1),
      c = i();
    return Cr(u), Tv(n, E(), o, c), c;
  } finally {
    Y(a);
  }
}
function Hv(e, t) {
  if (t)
    for (let n = t.length - 1; n >= 0; n--) {
      let r = t[n];
      if (e === r.name) return r;
    }
}
function T0(e, t, n) {
  let r = e + B,
    o = E(),
    i = wc(o, r);
  return Uv(o, r) ? $v(o, cp(), t, i.transform, n, i) : i.transform(n);
}
function Uv(e, t) {
  return e[v].data[t].pure;
}
var N0 = (() => {
  let t = class t {
    log(r) {
      console.log(r);
    }
    warn(r) {
      console.warn(r);
    }
  };
  (t.ɵfac = function (o) {
    return new (o || t)();
  }),
    (t.ɵprov = P({ token: t, factory: t.ɵfac, providedIn: 'platform' }));
  let e = t;
  return e;
})();
var zv = new A('');
function so(e) {
  return !!e && typeof e.then == 'function';
}
function Gs(e) {
  return !!e && typeof e.subscribe == 'function';
}
var Gv = new A(''),
  pd = (() => {
    let t = class t {
      constructor() {
        (this.initialized = !1),
          (this.done = !1),
          (this.donePromise = new Promise((r, o) => {
            (this.resolve = r), (this.reject = o);
          })),
          (this.appInits = x(Gv, { optional: !0 }) ?? []);
      }
      runInitializers() {
        if (this.initialized) return;
        let r = [];
        for (let i of this.appInits) {
          let s = i();
          if (so(s)) r.push(s);
          else if (Gs(s)) {
            let a = new Promise((u, c) => {
              s.subscribe({ complete: u, error: c });
            });
            r.push(a);
          }
        }
        let o = () => {
          (this.done = !0), this.resolve();
        };
        Promise.all(r)
          .then(() => {
            o();
          })
          .catch((i) => {
            this.reject(i);
          }),
          r.length === 0 && o(),
          (this.initialized = !0);
      }
    };
    (t.ɵfac = function (o) {
      return new (o || t)();
    }),
      (t.ɵprov = P({ token: t, factory: t.ɵfac, providedIn: 'root' }));
    let e = t;
    return e;
  })(),
  Wv = new A('');
function qv() {
  ya(() => {
    throw new S(600, !1);
  });
}
function Zv(e) {
  return e.isBoundToModule;
}
var Yv = 10;
function Qv(e, t, n) {
  try {
    let r = n();
    return so(r)
      ? r.catch((o) => {
          throw (t.runOutsideAngular(() => e.handleError(o)), o);
        })
      : r;
  } catch (r) {
    throw (t.runOutsideAngular(() => e.handleError(r)), r);
  }
}
var ao = (() => {
  let t = class t {
    constructor() {
      (this._bootstrapListeners = []),
        (this._runningTick = !1),
        (this._destroyed = !1),
        (this._destroyListeners = []),
        (this._views = []),
        (this.internalErrorHandler = x(Up)),
        (this.afterRenderEffectManager = x(Hs)),
        (this.zonelessEnabled = x($s)),
        (this.externalTestViews = new Set()),
        (this.beforeRender = new re()),
        (this.afterTick = new re()),
        (this.componentTypes = []),
        (this.components = []),
        (this.isStable = x(Kr).hasPendingTasks.pipe(Ce((r) => !r))),
        (this._injector = x(Ve));
    }
    get allViews() {
      return [...this.externalTestViews.keys(), ...this._views];
    }
    get destroyed() {
      return this._destroyed;
    }
    whenStable() {
      let r;
      return new Promise((o) => {
        r = this.isStable.subscribe({
          next: (i) => {
            i && o();
          },
        });
      }).finally(() => {
        r.unsubscribe();
      });
    }
    get injector() {
      return this._injector;
    }
    bootstrap(r, o) {
      let i = r instanceof Nr;
      if (!this._injector.get(pd).done) {
        let f = !i && Nh(r),
          p = !1;
        throw new S(405, p);
      }
      let a;
      i ? (a = r) : (a = this._injector.get(Lt).resolveComponentFactory(r)),
        this.componentTypes.push(a.componentType);
      let u = Zv(a) ? void 0 : this._injector.get(He),
        c = o || a.selector,
        l = a.create(ut.NULL, [], c, u),
        d = l.location.nativeElement,
        h = l.injector.get(zv, null);
      return (
        h?.registerApplication(d),
        l.onDestroy(() => {
          this.detachView(l.hostView),
            lr(this.components, l),
            h?.unregisterApplication(d);
        }),
        this._loadComponent(l),
        l
      );
    }
    tick() {
      this._tick(!0);
    }
    _tick(r) {
      if (this._runningTick) throw new S(101, !1);
      let o = b(null);
      try {
        (this._runningTick = !0), this.detectChangesInAttachedViews(r);
      } catch (i) {
        this.internalErrorHandler(i);
      } finally {
        (this._runningTick = !1), b(o), this.afterTick.next();
      }
    }
    detectChangesInAttachedViews(r) {
      let o = null;
      this._injector.destroyed ||
        (o = this._injector.get(Ar, null, { optional: !0 }));
      let i = 0,
        s = this.afterRenderEffectManager;
      for (; i < Yv; ) {
        let a = i === 0;
        if (r || !a) {
          this.beforeRender.next(a);
          for (let { _lView: u, notifyErrorHandler: c } of this._views)
            Kv(u, c, a, this.zonelessEnabled);
        } else o?.begin?.(), o?.end?.();
        if (
          (i++,
          s.executeInternalCallbacks(),
          !this.allViews.some(({ _lView: u }) => un(u)) &&
            (s.execute(), !this.allViews.some(({ _lView: u }) => un(u))))
        )
          break;
      }
    }
    attachView(r) {
      let o = r;
      this._views.push(o), o.attachToAppRef(this);
    }
    detachView(r) {
      let o = r;
      lr(this._views, o), o.detachFromAppRef();
    }
    _loadComponent(r) {
      this.attachView(r.hostView), this.tick(), this.components.push(r);
      let o = this._injector.get(Wv, []);
      [...this._bootstrapListeners, ...o].forEach((i) => i(r));
    }
    ngOnDestroy() {
      if (!this._destroyed)
        try {
          this._destroyListeners.forEach((r) => r()),
            this._views.slice().forEach((r) => r.destroy());
        } finally {
          (this._destroyed = !0),
            (this._views = []),
            (this._bootstrapListeners = []),
            (this._destroyListeners = []);
        }
    }
    onDestroy(r) {
      return (
        this._destroyListeners.push(r), () => lr(this._destroyListeners, r)
      );
    }
    destroy() {
      if (this._destroyed) throw new S(406, !1);
      let r = this._injector;
      r.destroy && !r.destroyed && r.destroy();
    }
    get viewCount() {
      return this._views.length;
    }
    warnIfDestroyed() {}
  };
  (t.ɵfac = function (o) {
    return new (o || t)();
  }),
    (t.ɵprov = P({ token: t, factory: t.ɵfac, providedIn: 'root' }));
  let e = t;
  return e;
})();
function lr(e, t) {
  let n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
function Kv(e, t, n, r) {
  if (!n && !un(e)) return;
  $l(e, t, n && !r ? 0 : 1);
}
var es = class {
    constructor(t, n) {
      (this.ngModuleFactory = t), (this.componentFactories = n);
    }
  },
  A0 = (() => {
    let t = class t {
      compileModuleSync(r) {
        return new Hi(r);
      }
      compileModuleAsync(r) {
        return Promise.resolve(this.compileModuleSync(r));
      }
      compileModuleAndAllComponentsSync(r) {
        let o = this.compileModuleSync(r),
          i = ic(r),
          s = dl(i.declarations).reduce((a, u) => {
            let c = je(u);
            return c && a.push(new jt(c)), a;
          }, []);
        return new es(o, s);
      }
      compileModuleAndAllComponentsAsync(r) {
        return Promise.resolve(this.compileModuleAndAllComponentsSync(r));
      }
      clearCache() {}
      clearCacheFor(r) {}
      getModuleId(r) {}
    };
    (t.ɵfac = function (o) {
      return new (o || t)();
    }),
      (t.ɵprov = P({ token: t, factory: t.ɵfac, providedIn: 'root' }));
    let e = t;
    return e;
  })();
var Jv = (() => {
    let t = class t {
      constructor() {
        (this.zone = x(X)),
          (this.changeDetectionScheduler = x(kt)),
          (this.applicationRef = x(ao));
      }
      initialize() {
        this._onMicrotaskEmptySubscription ||
          (this._onMicrotaskEmptySubscription =
            this.zone.onMicrotaskEmpty.subscribe({
              next: () => {
                this.changeDetectionScheduler.runningTick ||
                  this.zone.run(() => {
                    this.applicationRef.tick();
                  });
              },
            }));
      }
      ngOnDestroy() {
        this._onMicrotaskEmptySubscription?.unsubscribe();
      }
    };
    (t.ɵfac = function (o) {
      return new (o || t)();
    }),
      (t.ɵprov = P({ token: t, factory: t.ɵfac, providedIn: 'root' }));
    let e = t;
    return e;
  })(),
  Xv = new A('', { factory: () => !1 });
function gd({ ngZoneFactory: e, ignoreChangesOutsideZone: t }) {
  return (
    (e ??= () => new X(md())),
    [
      { provide: X, useFactory: e },
      {
        provide: mr,
        multi: !0,
        useFactory: () => {
          let n = x(Jv, { optional: !0 });
          return () => n.initialize();
        },
      },
      {
        provide: mr,
        multi: !0,
        useFactory: () => {
          let n = x(eD);
          return () => {
            n.initialize();
          };
        },
      },
      t === !0 ? { provide: Gl, useValue: !0 } : [],
    ]
  );
}
function O0(e) {
  let t = e?.ignoreChangesOutsideZone,
    n = gd({
      ngZoneFactory: () => {
        let r = md(e);
        return (
          r.shouldCoalesceEventChangeDetection && Ge('NgZone_CoalesceEvent'),
          new X(r)
        );
      },
      ignoreChangesOutsideZone: t,
    });
  return Oh([{ provide: Xv, useValue: !0 }, { provide: $s, useValue: !1 }, n]);
}
function md(e) {
  return {
    enableLongStackTrace: !1,
    shouldCoalesceEventChangeDetection: e?.eventCoalescing ?? !1,
    shouldCoalesceRunChangeDetection: e?.runCoalescing ?? !1,
  };
}
var eD = (() => {
  let t = class t {
    constructor() {
      (this.subscription = new k()),
        (this.initialized = !1),
        (this.zone = x(X)),
        (this.pendingTasks = x(Kr));
    }
    initialize() {
      if (this.initialized) return;
      this.initialized = !0;
      let r = null;
      !this.zone.isStable &&
        !this.zone.hasPendingMacrotasks &&
        !this.zone.hasPendingMicrotasks &&
        (r = this.pendingTasks.add()),
        this.zone.runOutsideAngular(() => {
          this.subscription.add(
            this.zone.onStable.subscribe(() => {
              X.assertNotInAngularZone(),
                queueMicrotask(() => {
                  r !== null &&
                    !this.zone.hasPendingMacrotasks &&
                    !this.zone.hasPendingMicrotasks &&
                    (this.pendingTasks.remove(r), (r = null));
                });
            })
          );
        }),
        this.subscription.add(
          this.zone.onUnstable.subscribe(() => {
            X.assertInAngularZone(), (r ??= this.pendingTasks.add());
          })
        );
    }
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
  };
  (t.ɵfac = function (o) {
    return new (o || t)();
  }),
    (t.ɵprov = P({ token: t, factory: t.ɵfac, providedIn: 'root' }));
  let e = t;
  return e;
})();
var tD = (() => {
  let t = class t {
    constructor() {
      (this.appRef = x(ao)),
        (this.taskService = x(Kr)),
        (this.ngZone = x(X)),
        (this.zonelessEnabled = x($s)),
        (this.disableScheduling = x(Gl, { optional: !0 }) ?? !1),
        (this.zoneIsDefined = typeof Zone < 'u' && !!Zone.root.run),
        (this.schedulerTickApplyArgs = [{ data: { __scheduler_tick__: !0 } }]),
        (this.subscriptions = new k()),
        (this.angularZoneId = this.zoneIsDefined
          ? this.ngZone._inner?.get(Mr)
          : null),
        (this.cancelScheduledCallback = null),
        (this.shouldRefreshViews = !1),
        (this.useMicrotaskScheduler = !1),
        (this.runningTick = !1),
        (this.pendingRenderTaskId = null),
        this.subscriptions.add(
          this.appRef.afterTick.subscribe(() => {
            this.runningTick || this.cleanup();
          })
        ),
        this.subscriptions.add(
          this.ngZone.onUnstable.subscribe(() => {
            this.runningTick || this.cleanup();
          })
        ),
        (this.disableScheduling ||=
          !this.zonelessEnabled &&
          (this.ngZone instanceof gi || !this.zoneIsDefined));
    }
    notify(r) {
      if (!this.zonelessEnabled && r === 5) return;
      switch (r) {
        case 3:
        case 2:
        case 0:
        case 4:
        case 5:
        case 1: {
          this.shouldRefreshViews = !0;
          break;
        }
        case 8:
        case 7:
        case 6:
        case 9:
        default:
      }
      if (!this.shouldScheduleTick()) return;
      let o = this.useMicrotaskScheduler ? fu : Yc;
      (this.pendingRenderTaskId = this.taskService.add()),
        this.zoneIsDefined
          ? Zone.root.run(() => {
              this.cancelScheduledCallback = o(() => {
                this.tick(this.shouldRefreshViews);
              });
            })
          : (this.cancelScheduledCallback = o(() => {
              this.tick(this.shouldRefreshViews);
            }));
    }
    shouldScheduleTick() {
      return !(
        this.disableScheduling ||
        this.pendingRenderTaskId !== null ||
        this.runningTick ||
        this.appRef._runningTick ||
        (!this.zonelessEnabled &&
          this.zoneIsDefined &&
          Zone.current.get(Mr + this.angularZoneId))
      );
    }
    tick(r) {
      if (this.runningTick || this.appRef.destroyed) return;
      let o = this.taskService.add();
      try {
        this.ngZone.run(
          () => {
            (this.runningTick = !0), this.appRef._tick(r);
          },
          void 0,
          this.schedulerTickApplyArgs
        );
      } catch (i) {
        throw (this.taskService.remove(o), i);
      } finally {
        this.cleanup();
      }
      (this.useMicrotaskScheduler = !0),
        fu(() => {
          (this.useMicrotaskScheduler = !1), this.taskService.remove(o);
        });
    }
    ngOnDestroy() {
      this.subscriptions.unsubscribe(), this.cleanup();
    }
    cleanup() {
      if (
        ((this.shouldRefreshViews = !1),
        (this.runningTick = !1),
        this.cancelScheduledCallback?.(),
        (this.cancelScheduledCallback = null),
        this.pendingRenderTaskId !== null)
      ) {
        let r = this.pendingRenderTaskId;
        (this.pendingRenderTaskId = null), this.taskService.remove(r);
      }
    }
  };
  (t.ɵfac = function (o) {
    return new (o || t)();
  }),
    (t.ɵprov = P({ token: t, factory: t.ɵfac, providedIn: 'root' }));
  let e = t;
  return e;
})();
function nD() {
  return (typeof $localize < 'u' && $localize.locale) || Br;
}
var Ws = new A('', {
  providedIn: 'root',
  factory: () => x(Ws, _.Optional | _.SkipSelf) || nD(),
});
var yd = new A('');
function ir(e) {
  return !!e.platformInjector;
}
function rD(e) {
  let t = ir(e) ? e.r3Injector : e.moduleRef.injector,
    n = t.get(X);
  return n.run(() => {
    ir(e)
      ? e.r3Injector.resolveInjectorInitializers()
      : e.moduleRef.resolveInjectorInitializers();
    let r = t.get(Ft, null),
      o;
    if (
      (n.runOutsideAngular(() => {
        o = n.onError.subscribe({
          next: (i) => {
            r.handleError(i);
          },
        });
      }),
      ir(e))
    ) {
      let i = () => t.destroy(),
        s = e.platformInjector.get(yd);
      s.add(i),
        t.onDestroy(() => {
          o.unsubscribe(), s.delete(i);
        });
    } else
      e.moduleRef.onDestroy(() => {
        lr(e.allPlatformModules, e.moduleRef), o.unsubscribe();
      });
    return Qv(r, n, () => {
      let i = t.get(pd);
      return (
        i.runInitializers(),
        i.donePromise.then(() => {
          let s = t.get(Ws, Br);
          if ((wv(s || Br), ir(e))) {
            let a = t.get(ao);
            return (
              e.rootComponent !== void 0 && a.bootstrap(e.rootComponent), a
            );
          } else return oD(e.moduleRef, e.allPlatformModules), e.moduleRef;
        })
      );
    });
  });
}
function oD(e, t) {
  let n = e.injector.get(ao);
  if (e._bootstrapComponents.length > 0)
    e._bootstrapComponents.forEach((r) => n.bootstrap(r));
  else if (e.instance.ngDoBootstrap) e.instance.ngDoBootstrap(n);
  else throw new S(-403, !1);
  t.push(e);
}
var dr = null;
function iD(e = [], t) {
  return ut.create({
    name: t,
    providers: [
      { provide: dc, useValue: 'platform' },
      { provide: yd, useValue: new Set([() => (dr = null)]) },
      ...e,
    ],
  });
}
function sD(e = []) {
  if (dr) return dr;
  let t = iD(e);
  return (dr = t), qv(), aD(t), t;
}
function aD(e) {
  e.get(Xp, null)?.forEach((n) => n());
}
var qs = (() => {
  let t = class t {};
  t.__NG_ELEMENT_ID__ = uD;
  let e = t;
  return e;
})();
function uD(e) {
  return cD(V(), E(), (e & 16) === 16);
}
function cD(e, t, n) {
  if (Gr(e) && !n) {
    let r = Ue(e.index, t);
    return new ct(r, r);
  } else if (e.type & 175) {
    let r = t[te];
    return new ct(r, t);
  }
  return null;
}
var ts = class {
    constructor() {}
    supports(t) {
      return Xl(t);
    }
    create(t) {
      return new ns(t);
    }
  },
  lD = (e, t) => t,
  ns = class {
    constructor(t) {
      (this.length = 0),
        (this._linkedRecords = null),
        (this._unlinkedRecords = null),
        (this._previousItHead = null),
        (this._itHead = null),
        (this._itTail = null),
        (this._additionsHead = null),
        (this._additionsTail = null),
        (this._movesHead = null),
        (this._movesTail = null),
        (this._removalsHead = null),
        (this._removalsTail = null),
        (this._identityChangesHead = null),
        (this._identityChangesTail = null),
        (this._trackByFn = t || lD);
    }
    forEachItem(t) {
      let n;
      for (n = this._itHead; n !== null; n = n._next) t(n);
    }
    forEachOperation(t) {
      let n = this._itHead,
        r = this._removalsHead,
        o = 0,
        i = null;
      for (; n || r; ) {
        let s = !r || (n && n.currentIndex < Ru(r, o, i)) ? n : r,
          a = Ru(s, o, i),
          u = s.currentIndex;
        if (s === r) o--, (r = r._nextRemoved);
        else if (((n = n._next), s.previousIndex == null)) o++;
        else {
          i || (i = []);
          let c = a - o,
            l = u - o;
          if (c != l) {
            for (let h = 0; h < c; h++) {
              let f = h < i.length ? i[h] : (i[h] = 0),
                p = f + h;
              l <= p && p < c && (i[h] = f + 1);
            }
            let d = s.previousIndex;
            i[d] = l - c;
          }
        }
        a !== u && t(s, a, u);
      }
    }
    forEachPreviousItem(t) {
      let n;
      for (n = this._previousItHead; n !== null; n = n._nextPrevious) t(n);
    }
    forEachAddedItem(t) {
      let n;
      for (n = this._additionsHead; n !== null; n = n._nextAdded) t(n);
    }
    forEachMovedItem(t) {
      let n;
      for (n = this._movesHead; n !== null; n = n._nextMoved) t(n);
    }
    forEachRemovedItem(t) {
      let n;
      for (n = this._removalsHead; n !== null; n = n._nextRemoved) t(n);
    }
    forEachIdentityChange(t) {
      let n;
      for (n = this._identityChangesHead; n !== null; n = n._nextIdentityChange)
        t(n);
    }
    diff(t) {
      if ((t == null && (t = []), !Xl(t))) throw new S(900, !1);
      return this.check(t) ? this : null;
    }
    onDestroy() {}
    check(t) {
      this._reset();
      let n = this._itHead,
        r = !1,
        o,
        i,
        s;
      if (Array.isArray(t)) {
        this.length = t.length;
        for (let a = 0; a < this.length; a++)
          (i = t[a]),
            (s = this._trackByFn(a, i)),
            n === null || !Object.is(n.trackById, s)
              ? ((n = this._mismatch(n, i, s, a)), (r = !0))
              : (r && (n = this._verifyReinsertion(n, i, s, a)),
                Object.is(n.item, i) || this._addIdentityChange(n, i)),
            (n = n._next);
      } else
        (o = 0),
          Ny(t, (a) => {
            (s = this._trackByFn(o, a)),
              n === null || !Object.is(n.trackById, s)
                ? ((n = this._mismatch(n, a, s, o)), (r = !0))
                : (r && (n = this._verifyReinsertion(n, a, s, o)),
                  Object.is(n.item, a) || this._addIdentityChange(n, a)),
              (n = n._next),
              o++;
          }),
          (this.length = o);
      return this._truncate(n), (this.collection = t), this.isDirty;
    }
    get isDirty() {
      return (
        this._additionsHead !== null ||
        this._movesHead !== null ||
        this._removalsHead !== null ||
        this._identityChangesHead !== null
      );
    }
    _reset() {
      if (this.isDirty) {
        let t;
        for (t = this._previousItHead = this._itHead; t !== null; t = t._next)
          t._nextPrevious = t._next;
        for (t = this._additionsHead; t !== null; t = t._nextAdded)
          t.previousIndex = t.currentIndex;
        for (
          this._additionsHead = this._additionsTail = null, t = this._movesHead;
          t !== null;
          t = t._nextMoved
        )
          t.previousIndex = t.currentIndex;
        (this._movesHead = this._movesTail = null),
          (this._removalsHead = this._removalsTail = null),
          (this._identityChangesHead = this._identityChangesTail = null);
      }
    }
    _mismatch(t, n, r, o) {
      let i;
      return (
        t === null ? (i = this._itTail) : ((i = t._prev), this._remove(t)),
        (t =
          this._unlinkedRecords === null
            ? null
            : this._unlinkedRecords.get(r, null)),
        t !== null
          ? (Object.is(t.item, n) || this._addIdentityChange(t, n),
            this._reinsertAfter(t, i, o))
          : ((t =
              this._linkedRecords === null
                ? null
                : this._linkedRecords.get(r, o)),
            t !== null
              ? (Object.is(t.item, n) || this._addIdentityChange(t, n),
                this._moveAfter(t, i, o))
              : (t = this._addAfter(new rs(n, r), i, o))),
        t
      );
    }
    _verifyReinsertion(t, n, r, o) {
      let i =
        this._unlinkedRecords === null
          ? null
          : this._unlinkedRecords.get(r, null);
      return (
        i !== null
          ? (t = this._reinsertAfter(i, t._prev, o))
          : t.currentIndex != o &&
            ((t.currentIndex = o), this._addToMoves(t, o)),
        t
      );
    }
    _truncate(t) {
      for (; t !== null; ) {
        let n = t._next;
        this._addToRemovals(this._unlink(t)), (t = n);
      }
      this._unlinkedRecords !== null && this._unlinkedRecords.clear(),
        this._additionsTail !== null && (this._additionsTail._nextAdded = null),
        this._movesTail !== null && (this._movesTail._nextMoved = null),
        this._itTail !== null && (this._itTail._next = null),
        this._removalsTail !== null && (this._removalsTail._nextRemoved = null),
        this._identityChangesTail !== null &&
          (this._identityChangesTail._nextIdentityChange = null);
    }
    _reinsertAfter(t, n, r) {
      this._unlinkedRecords !== null && this._unlinkedRecords.remove(t);
      let o = t._prevRemoved,
        i = t._nextRemoved;
      return (
        o === null ? (this._removalsHead = i) : (o._nextRemoved = i),
        i === null ? (this._removalsTail = o) : (i._prevRemoved = o),
        this._insertAfter(t, n, r),
        this._addToMoves(t, r),
        t
      );
    }
    _moveAfter(t, n, r) {
      return (
        this._unlink(t), this._insertAfter(t, n, r), this._addToMoves(t, r), t
      );
    }
    _addAfter(t, n, r) {
      return (
        this._insertAfter(t, n, r),
        this._additionsTail === null
          ? (this._additionsTail = this._additionsHead = t)
          : (this._additionsTail = this._additionsTail._nextAdded = t),
        t
      );
    }
    _insertAfter(t, n, r) {
      let o = n === null ? this._itHead : n._next;
      return (
        (t._next = o),
        (t._prev = n),
        o === null ? (this._itTail = t) : (o._prev = t),
        n === null ? (this._itHead = t) : (n._next = t),
        this._linkedRecords === null && (this._linkedRecords = new $r()),
        this._linkedRecords.put(t),
        (t.currentIndex = r),
        t
      );
    }
    _remove(t) {
      return this._addToRemovals(this._unlink(t));
    }
    _unlink(t) {
      this._linkedRecords !== null && this._linkedRecords.remove(t);
      let n = t._prev,
        r = t._next;
      return (
        n === null ? (this._itHead = r) : (n._next = r),
        r === null ? (this._itTail = n) : (r._prev = n),
        t
      );
    }
    _addToMoves(t, n) {
      return (
        t.previousIndex === n ||
          (this._movesTail === null
            ? (this._movesTail = this._movesHead = t)
            : (this._movesTail = this._movesTail._nextMoved = t)),
        t
      );
    }
    _addToRemovals(t) {
      return (
        this._unlinkedRecords === null && (this._unlinkedRecords = new $r()),
        this._unlinkedRecords.put(t),
        (t.currentIndex = null),
        (t._nextRemoved = null),
        this._removalsTail === null
          ? ((this._removalsTail = this._removalsHead = t),
            (t._prevRemoved = null))
          : ((t._prevRemoved = this._removalsTail),
            (this._removalsTail = this._removalsTail._nextRemoved = t)),
        t
      );
    }
    _addIdentityChange(t, n) {
      return (
        (t.item = n),
        this._identityChangesTail === null
          ? (this._identityChangesTail = this._identityChangesHead = t)
          : (this._identityChangesTail =
              this._identityChangesTail._nextIdentityChange =
                t),
        t
      );
    }
  },
  rs = class {
    constructor(t, n) {
      (this.item = t),
        (this.trackById = n),
        (this.currentIndex = null),
        (this.previousIndex = null),
        (this._nextPrevious = null),
        (this._prev = null),
        (this._next = null),
        (this._prevDup = null),
        (this._nextDup = null),
        (this._prevRemoved = null),
        (this._nextRemoved = null),
        (this._nextAdded = null),
        (this._nextMoved = null),
        (this._nextIdentityChange = null);
    }
  },
  os = class {
    constructor() {
      (this._head = null), (this._tail = null);
    }
    add(t) {
      this._head === null
        ? ((this._head = this._tail = t),
          (t._nextDup = null),
          (t._prevDup = null))
        : ((this._tail._nextDup = t),
          (t._prevDup = this._tail),
          (t._nextDup = null),
          (this._tail = t));
    }
    get(t, n) {
      let r;
      for (r = this._head; r !== null; r = r._nextDup)
        if ((n === null || n <= r.currentIndex) && Object.is(r.trackById, t))
          return r;
      return null;
    }
    remove(t) {
      let n = t._prevDup,
        r = t._nextDup;
      return (
        n === null ? (this._head = r) : (n._nextDup = r),
        r === null ? (this._tail = n) : (r._prevDup = n),
        this._head === null
      );
    }
  },
  $r = class {
    constructor() {
      this.map = new Map();
    }
    put(t) {
      let n = t.trackById,
        r = this.map.get(n);
      r || ((r = new os()), this.map.set(n, r)), r.add(t);
    }
    get(t, n) {
      let r = t,
        o = this.map.get(r);
      return o ? o.get(t, n) : null;
    }
    remove(t) {
      let n = t.trackById;
      return this.map.get(n).remove(t) && this.map.delete(n), t;
    }
    get isEmpty() {
      return this.map.size === 0;
    }
    clear() {
      this.map.clear();
    }
  };
function Ru(e, t, n) {
  let r = e.previousIndex;
  if (r === null) return r;
  let o = 0;
  return n && r < n.length && (o = n[r]), r + t + o;
}
function Pu() {
  return new vd([new ts()]);
}
var vd = (() => {
  let t = class t {
    constructor(r) {
      this.factories = r;
    }
    static create(r, o) {
      if (o != null) {
        let i = o.factories.slice();
        r = r.concat(i);
      }
      return new t(r);
    }
    static extend(r) {
      return {
        provide: t,
        useFactory: (o) => t.create(r, o || Pu()),
        deps: [[t, new uh(), new ah()]],
      };
    }
    find(r) {
      let o = this.factories.find((i) => i.supports(r));
      if (o != null) return o;
      throw new S(901, !1);
    }
  };
  t.ɵprov = P({ token: t, providedIn: 'root', factory: Pu });
  let e = t;
  return e;
})();
function F0(e) {
  try {
    let { rootComponent: t, appProviders: n, platformProviders: r } = e,
      o = sD(r),
      i = [gd({}), { provide: kt, useExisting: tD }, ...(n || [])],
      s = new Pr({
        providers: i,
        parent: o,
        debugName: '',
        runEnvironmentInitializers: !1,
      });
    return rD({
      r3Injector: s.injector,
      platformInjector: o,
      rootComponent: t,
    });
  } catch (t) {
    return Promise.reject(t);
  }
}
var R0 = new A('');
function dD(e) {
  return typeof e == 'boolean' ? e : e != null && e !== 'false';
}
function fD(e, t = NaN) {
  return !isNaN(parseFloat(e)) && !isNaN(Number(e)) ? Number(e) : t;
}
function P0(e, t) {
  Ge('NgSignals');
  let n = pa(e);
  return t?.equal && (n[Ee].equal = t.equal), n;
}
function Zs(e) {
  let t = b(null);
  try {
    return e();
  } finally {
    b(t);
  }
}
function k0(e) {
  let t = je(e);
  if (!t) return null;
  let n = new jt(t);
  return {
    get selector() {
      return n.selector;
    },
    get type() {
      return n.componentType;
    },
    get inputs() {
      return n.inputs;
    },
    get outputs() {
      return n.outputs;
    },
    get ngContentSelectors() {
      return n.ngContentSelectors;
    },
    get isStandalone() {
      return t.standalone;
    },
    get isSignal() {
      return t.signals;
    },
  };
}
var Cd = null;
function Qs() {
  return Cd;
}
function ax(e) {
  Cd ??= e;
}
var Dd = class {};
var ta = new A(''),
  na = (() => {
    let t = class t {
      historyGo(r) {
        throw new Error('');
      }
    };
    (t.ɵfac = function (o) {
      return new (o || t)();
    }),
      (t.ɵprov = P({ token: t, factory: () => x(pD), providedIn: 'platform' }));
    let e = t;
    return e;
  })(),
  ux = new A(''),
  pD = (() => {
    let t = class t extends na {
      constructor() {
        super(),
          (this._doc = x(ta)),
          (this._location = window.location),
          (this._history = window.history);
      }
      getBaseHrefFromDOM() {
        return Qs().getBaseHref(this._doc);
      }
      onPopState(r) {
        let o = Qs().getGlobalEventTarget(this._doc, 'window');
        return (
          o.addEventListener('popstate', r, !1),
          () => o.removeEventListener('popstate', r)
        );
      }
      onHashChange(r) {
        let o = Qs().getGlobalEventTarget(this._doc, 'window');
        return (
          o.addEventListener('hashchange', r, !1),
          () => o.removeEventListener('hashchange', r)
        );
      }
      get href() {
        return this._location.href;
      }
      get protocol() {
        return this._location.protocol;
      }
      get hostname() {
        return this._location.hostname;
      }
      get port() {
        return this._location.port;
      }
      get pathname() {
        return this._location.pathname;
      }
      get search() {
        return this._location.search;
      }
      get hash() {
        return this._location.hash;
      }
      set pathname(r) {
        this._location.pathname = r;
      }
      pushState(r, o, i) {
        this._history.pushState(r, o, i);
      }
      replaceState(r, o, i) {
        this._history.replaceState(r, o, i);
      }
      forward() {
        this._history.forward();
      }
      back() {
        this._history.back();
      }
      historyGo(r = 0) {
        this._history.go(r);
      }
      getState() {
        return this._history.state;
      }
    };
    (t.ɵfac = function (o) {
      return new (o || t)();
    }),
      (t.ɵprov = P({
        token: t,
        factory: () => new t(),
        providedIn: 'platform',
      }));
    let e = t;
    return e;
  })();
function ra(e, t) {
  if (e.length == 0) return t;
  if (t.length == 0) return e;
  let n = 0;
  return (
    e.endsWith('/') && n++,
    t.startsWith('/') && n++,
    n == 2 ? e + t.substring(1) : n == 1 ? e + t : e + '/' + t
  );
}
function Id(e) {
  let t = e.match(/#|\?|$/),
    n = (t && t.index) || e.length,
    r = n - (e[n - 1] === '/' ? 1 : 0);
  return e.slice(0, r) + e.slice(n);
}
function Ae(e) {
  return e && e[0] !== '?' ? '?' + e : e;
}
var uo = (() => {
    let t = class t {
      historyGo(r) {
        throw new Error('');
      }
    };
    (t.ɵfac = function (o) {
      return new (o || t)();
    }),
      (t.ɵprov = P({ token: t, factory: () => x(gD), providedIn: 'root' }));
    let e = t;
    return e;
  })(),
  bd = new A(''),
  gD = (() => {
    let t = class t extends uo {
      constructor(r, o) {
        super(),
          (this._platformLocation = r),
          (this._removeListenerFns = []),
          (this._baseHref =
            o ??
            this._platformLocation.getBaseHrefFromDOM() ??
            x(ta).location?.origin ??
            '');
      }
      ngOnDestroy() {
        for (; this._removeListenerFns.length; )
          this._removeListenerFns.pop()();
      }
      onPopState(r) {
        this._removeListenerFns.push(
          this._platformLocation.onPopState(r),
          this._platformLocation.onHashChange(r)
        );
      }
      getBaseHref() {
        return this._baseHref;
      }
      prepareExternalUrl(r) {
        return ra(this._baseHref, r);
      }
      path(r = !1) {
        let o =
            this._platformLocation.pathname + Ae(this._platformLocation.search),
          i = this._platformLocation.hash;
        return i && r ? `${o}${i}` : o;
      }
      pushState(r, o, i, s) {
        let a = this.prepareExternalUrl(i + Ae(s));
        this._platformLocation.pushState(r, o, a);
      }
      replaceState(r, o, i, s) {
        let a = this.prepareExternalUrl(i + Ae(s));
        this._platformLocation.replaceState(r, o, a);
      }
      forward() {
        this._platformLocation.forward();
      }
      back() {
        this._platformLocation.back();
      }
      getState() {
        return this._platformLocation.getState();
      }
      historyGo(r = 0) {
        this._platformLocation.historyGo?.(r);
      }
    };
    (t.ɵfac = function (o) {
      return new (o || t)(U(na), U(bd, 8));
    }),
      (t.ɵprov = P({ token: t, factory: t.ɵfac, providedIn: 'root' }));
    let e = t;
    return e;
  })(),
  cx = (() => {
    let t = class t extends uo {
      constructor(r, o) {
        super(),
          (this._platformLocation = r),
          (this._baseHref = ''),
          (this._removeListenerFns = []),
          o != null && (this._baseHref = o);
      }
      ngOnDestroy() {
        for (; this._removeListenerFns.length; )
          this._removeListenerFns.pop()();
      }
      onPopState(r) {
        this._removeListenerFns.push(
          this._platformLocation.onPopState(r),
          this._platformLocation.onHashChange(r)
        );
      }
      getBaseHref() {
        return this._baseHref;
      }
      path(r = !1) {
        let o = this._platformLocation.hash ?? '#';
        return o.length > 0 ? o.substring(1) : o;
      }
      prepareExternalUrl(r) {
        let o = ra(this._baseHref, r);
        return o.length > 0 ? '#' + o : o;
      }
      pushState(r, o, i, s) {
        let a = this.prepareExternalUrl(i + Ae(s));
        a.length == 0 && (a = this._platformLocation.pathname),
          this._platformLocation.pushState(r, o, a);
      }
      replaceState(r, o, i, s) {
        let a = this.prepareExternalUrl(i + Ae(s));
        a.length == 0 && (a = this._platformLocation.pathname),
          this._platformLocation.replaceState(r, o, a);
      }
      forward() {
        this._platformLocation.forward();
      }
      back() {
        this._platformLocation.back();
      }
      getState() {
        return this._platformLocation.getState();
      }
      historyGo(r = 0) {
        this._platformLocation.historyGo?.(r);
      }
    };
    (t.ɵfac = function (o) {
      return new (o || t)(U(na), U(bd, 8));
    }),
      (t.ɵprov = P({ token: t, factory: t.ɵfac }));
    let e = t;
    return e;
  })(),
  mD = (() => {
    let t = class t {
      constructor(r) {
        (this._subject = new de()),
          (this._urlChangeListeners = []),
          (this._urlChangeSubscription = null),
          (this._locationStrategy = r);
        let o = this._locationStrategy.getBaseHref();
        (this._basePath = DD(Id(Ed(o)))),
          this._locationStrategy.onPopState((i) => {
            this._subject.emit({
              url: this.path(!0),
              pop: !0,
              state: i.state,
              type: i.type,
            });
          });
      }
      ngOnDestroy() {
        this._urlChangeSubscription?.unsubscribe(),
          (this._urlChangeListeners = []);
      }
      path(r = !1) {
        return this.normalize(this._locationStrategy.path(r));
      }
      getState() {
        return this._locationStrategy.getState();
      }
      isCurrentPathEqualTo(r, o = '') {
        return this.path() == this.normalize(r + Ae(o));
      }
      normalize(r) {
        return t.stripTrailingSlash(vD(this._basePath, Ed(r)));
      }
      prepareExternalUrl(r) {
        return (
          r && r[0] !== '/' && (r = '/' + r),
          this._locationStrategy.prepareExternalUrl(r)
        );
      }
      go(r, o = '', i = null) {
        this._locationStrategy.pushState(i, '', r, o),
          this._notifyUrlChangeListeners(this.prepareExternalUrl(r + Ae(o)), i);
      }
      replaceState(r, o = '', i = null) {
        this._locationStrategy.replaceState(i, '', r, o),
          this._notifyUrlChangeListeners(this.prepareExternalUrl(r + Ae(o)), i);
      }
      forward() {
        this._locationStrategy.forward();
      }
      back() {
        this._locationStrategy.back();
      }
      historyGo(r = 0) {
        this._locationStrategy.historyGo?.(r);
      }
      onUrlChange(r) {
        return (
          this._urlChangeListeners.push(r),
          (this._urlChangeSubscription ??= this.subscribe((o) => {
            this._notifyUrlChangeListeners(o.url, o.state);
          })),
          () => {
            let o = this._urlChangeListeners.indexOf(r);
            this._urlChangeListeners.splice(o, 1),
              this._urlChangeListeners.length === 0 &&
                (this._urlChangeSubscription?.unsubscribe(),
                (this._urlChangeSubscription = null));
          }
        );
      }
      _notifyUrlChangeListeners(r = '', o) {
        this._urlChangeListeners.forEach((i) => i(r, o));
      }
      subscribe(r, o, i) {
        return this._subject.subscribe({ next: r, error: o, complete: i });
      }
    };
    (t.normalizeQueryParams = Ae),
      (t.joinWithSlash = ra),
      (t.stripTrailingSlash = Id),
      (t.ɵfac = function (o) {
        return new (o || t)(U(uo));
      }),
      (t.ɵprov = P({ token: t, factory: () => yD(), providedIn: 'root' }));
    let e = t;
    return e;
  })();
function yD() {
  return new mD(U(uo));
}
function vD(e, t) {
  if (!e || !t.startsWith(e)) return t;
  let n = t.substring(e.length);
  return n === '' || ['/', ';', '?', '#'].includes(n[0]) ? n : t;
}
function Ed(e) {
  return e.replace(/\/index.html$/, '');
}
function DD(e) {
  if (new RegExp('^(https?:)?//').test(e)) {
    let [, n] = e.split(/\/\/[^\/]+/);
    return n;
  }
  return e;
}
function lx(e, t) {
  t = encodeURIComponent(t);
  for (let n of e.split(';')) {
    let r = n.indexOf('='),
      [o, i] = r == -1 ? [n, ''] : [n.slice(0, r), n.slice(r + 1)];
    if (o.trim() === t) return decodeURIComponent(i);
  }
  return null;
}
function ID(e, t) {
  return new S(2100, !1);
}
var Ks = class {
    createSubscription(t, n) {
      return Zs(() =>
        t.subscribe({
          next: n,
          error: (r) => {
            throw r;
          },
        })
      );
    }
    dispose(t) {
      Zs(() => t.unsubscribe());
    }
  },
  Js = class {
    createSubscription(t, n) {
      return t.then(n, (r) => {
        throw r;
      });
    }
    dispose(t) {}
  },
  ED = new Js(),
  wD = new Ks(),
  dx = (() => {
    let t = class t {
      constructor(r) {
        (this._latestValue = null),
          (this.markForCheckOnValueUpdate = !0),
          (this._subscription = null),
          (this._obj = null),
          (this._strategy = null),
          (this._ref = r);
      }
      ngOnDestroy() {
        this._subscription && this._dispose(), (this._ref = null);
      }
      transform(r) {
        if (!this._obj) {
          if (r)
            try {
              (this.markForCheckOnValueUpdate = !1), this._subscribe(r);
            } finally {
              this.markForCheckOnValueUpdate = !0;
            }
          return this._latestValue;
        }
        return r !== this._obj
          ? (this._dispose(), this.transform(r))
          : this._latestValue;
      }
      _subscribe(r) {
        (this._obj = r),
          (this._strategy = this._selectStrategy(r)),
          (this._subscription = this._strategy.createSubscription(r, (o) =>
            this._updateLatestValue(r, o)
          ));
      }
      _selectStrategy(r) {
        if (so(r)) return ED;
        if (Gs(r)) return wD;
        throw ID(t, r);
      }
      _dispose() {
        this._strategy.dispose(this._subscription),
          (this._latestValue = null),
          (this._subscription = null),
          (this._obj = null);
      }
      _updateLatestValue(r, o) {
        r === this._obj &&
          ((this._latestValue = o),
          this.markForCheckOnValueUpdate && this._ref?.markForCheck());
      }
    };
    (t.ɵfac = function (o) {
      return new (o || t)(Ut(qs, 16));
    }),
      (t.ɵpipe = nc({ name: 'async', type: t, pure: !1, standalone: !0 }));
    let e = t;
    return e;
  })();
var fx = (() => {
    let t = class t {};
    (t.ɵfac = function (o) {
      return new (o || t)();
    }),
      (t.ɵmod = tc({ type: t })),
      (t.ɵinj = $u({}));
    let e = t;
    return e;
  })(),
  CD = 'browser',
  bD = 'server';
function _D(e) {
  return e === CD;
}
function hx(e) {
  return e === bD;
}
var px = (() => {
    let t = class t {};
    t.ɵprov = P({
      token: t,
      providedIn: 'root',
      factory: () => (_D(x(Ms)) ? new Xs(x(ta), window) : new ea()),
    });
    let e = t;
    return e;
  })(),
  Xs = class {
    constructor(t, n) {
      (this.document = t), (this.window = n), (this.offset = () => [0, 0]);
    }
    setOffset(t) {
      Array.isArray(t) ? (this.offset = () => t) : (this.offset = t);
    }
    getScrollPosition() {
      return [this.window.scrollX, this.window.scrollY];
    }
    scrollToPosition(t) {
      this.window.scrollTo(t[0], t[1]);
    }
    scrollToAnchor(t) {
      let n = MD(this.document, t);
      n && (this.scrollToElement(n), n.focus());
    }
    setHistoryScrollRestoration(t) {
      this.window.history.scrollRestoration = t;
    }
    scrollToElement(t) {
      let n = t.getBoundingClientRect(),
        r = n.left + this.window.pageXOffset,
        o = n.top + this.window.pageYOffset,
        i = this.offset();
      this.window.scrollTo(r - i[0], o - i[1]);
    }
  };
function MD(e, t) {
  let n = e.getElementById(t) || e.getElementsByName(t)[0];
  if (n) return n;
  if (
    typeof e.createTreeWalker == 'function' &&
    e.body &&
    typeof e.body.attachShadow == 'function'
  ) {
    let r = e.createTreeWalker(e.body, NodeFilter.SHOW_ELEMENT),
      o = r.currentNode;
    for (; o; ) {
      let i = o.shadowRoot;
      if (i) {
        let s = i.getElementById(t) || i.querySelector(`[name="${t}"]`);
        if (s) return s;
      }
      o = r.nextNode();
    }
  }
  return null;
}
var ea = class {
    setOffset(t) {}
    getScrollPosition() {
      return [0, 0];
    }
    scrollToPosition(t) {}
    scrollToAnchor(t) {}
    setHistoryScrollRestoration(t) {}
  },
  wd = class {};
var ft = (function (e) {
    return (
      (e[(e.State = 0)] = 'State'),
      (e[(e.Transition = 1)] = 'Transition'),
      (e[(e.Sequence = 2)] = 'Sequence'),
      (e[(e.Group = 3)] = 'Group'),
      (e[(e.Animate = 4)] = 'Animate'),
      (e[(e.Keyframes = 5)] = 'Keyframes'),
      (e[(e.Style = 6)] = 'Style'),
      (e[(e.Trigger = 7)] = 'Trigger'),
      (e[(e.Reference = 8)] = 'Reference'),
      (e[(e.AnimateChild = 9)] = 'AnimateChild'),
      (e[(e.AnimateRef = 10)] = 'AnimateRef'),
      (e[(e.Query = 11)] = 'Query'),
      (e[(e.Stagger = 12)] = 'Stagger'),
      e
    );
  })(ft || {}),
  yx = '*';
function vx(e, t) {
  return { type: ft.Trigger, name: e, definitions: t, options: {} };
}
function Dx(e, t = null) {
  return { type: ft.Animate, styles: t, timings: e };
}
function Ix(e, t = null) {
  return { type: ft.Sequence, steps: e, options: t };
}
function Ex(e) {
  return { type: ft.Style, styles: e, offset: null };
}
function wx(e, t, n) {
  return { type: ft.State, name: e, styles: t, options: n };
}
function Cx(e, t, n = null) {
  return { type: ft.Transition, expr: e, animation: t, options: n };
}
var _d = class {
    constructor(t = 0, n = 0) {
      (this._onDoneFns = []),
        (this._onStartFns = []),
        (this._onDestroyFns = []),
        (this._originalOnDoneFns = []),
        (this._originalOnStartFns = []),
        (this._started = !1),
        (this._destroyed = !1),
        (this._finished = !1),
        (this._position = 0),
        (this.parentPlayer = null),
        (this.totalTime = t + n);
    }
    _onFinish() {
      this._finished ||
        ((this._finished = !0),
        this._onDoneFns.forEach((t) => t()),
        (this._onDoneFns = []));
    }
    onStart(t) {
      this._originalOnStartFns.push(t), this._onStartFns.push(t);
    }
    onDone(t) {
      this._originalOnDoneFns.push(t), this._onDoneFns.push(t);
    }
    onDestroy(t) {
      this._onDestroyFns.push(t);
    }
    hasStarted() {
      return this._started;
    }
    init() {}
    play() {
      this.hasStarted() || (this._onStart(), this.triggerMicrotask()),
        (this._started = !0);
    }
    triggerMicrotask() {
      queueMicrotask(() => this._onFinish());
    }
    _onStart() {
      this._onStartFns.forEach((t) => t()), (this._onStartFns = []);
    }
    pause() {}
    restart() {}
    finish() {
      this._onFinish();
    }
    destroy() {
      this._destroyed ||
        ((this._destroyed = !0),
        this.hasStarted() || this._onStart(),
        this.finish(),
        this._onDestroyFns.forEach((t) => t()),
        (this._onDestroyFns = []));
    }
    reset() {
      (this._started = !1),
        (this._finished = !1),
        (this._onStartFns = this._originalOnStartFns),
        (this._onDoneFns = this._originalOnDoneFns);
    }
    setPosition(t) {
      this._position = this.totalTime ? t * this.totalTime : 1;
    }
    getPosition() {
      return this.totalTime ? this._position / this.totalTime : 1;
    }
    triggerCallback(t) {
      let n = t == 'start' ? this._onStartFns : this._onDoneFns;
      n.forEach((r) => r()), (n.length = 0);
    }
  },
  Md = class {
    constructor(t) {
      (this._onDoneFns = []),
        (this._onStartFns = []),
        (this._finished = !1),
        (this._started = !1),
        (this._destroyed = !1),
        (this._onDestroyFns = []),
        (this.parentPlayer = null),
        (this.totalTime = 0),
        (this.players = t);
      let n = 0,
        r = 0,
        o = 0,
        i = this.players.length;
      i == 0
        ? queueMicrotask(() => this._onFinish())
        : this.players.forEach((s) => {
            s.onDone(() => {
              ++n == i && this._onFinish();
            }),
              s.onDestroy(() => {
                ++r == i && this._onDestroy();
              }),
              s.onStart(() => {
                ++o == i && this._onStart();
              });
          }),
        (this.totalTime = this.players.reduce(
          (s, a) => Math.max(s, a.totalTime),
          0
        ));
    }
    _onFinish() {
      this._finished ||
        ((this._finished = !0),
        this._onDoneFns.forEach((t) => t()),
        (this._onDoneFns = []));
    }
    init() {
      this.players.forEach((t) => t.init());
    }
    onStart(t) {
      this._onStartFns.push(t);
    }
    _onStart() {
      this.hasStarted() ||
        ((this._started = !0),
        this._onStartFns.forEach((t) => t()),
        (this._onStartFns = []));
    }
    onDone(t) {
      this._onDoneFns.push(t);
    }
    onDestroy(t) {
      this._onDestroyFns.push(t);
    }
    hasStarted() {
      return this._started;
    }
    play() {
      this.parentPlayer || this.init(),
        this._onStart(),
        this.players.forEach((t) => t.play());
    }
    pause() {
      this.players.forEach((t) => t.pause());
    }
    restart() {
      this.players.forEach((t) => t.restart());
    }
    finish() {
      this._onFinish(), this.players.forEach((t) => t.finish());
    }
    destroy() {
      this._onDestroy();
    }
    _onDestroy() {
      this._destroyed ||
        ((this._destroyed = !0),
        this._onFinish(),
        this.players.forEach((t) => t.destroy()),
        this._onDestroyFns.forEach((t) => t()),
        (this._onDestroyFns = []));
    }
    reset() {
      this.players.forEach((t) => t.reset()),
        (this._destroyed = !1),
        (this._finished = !1),
        (this._started = !1);
    }
    setPosition(t) {
      let n = t * this.totalTime;
      this.players.forEach((r) => {
        let o = r.totalTime ? Math.min(1, n / r.totalTime) : 1;
        r.setPosition(o);
      });
    }
    getPosition() {
      let t = this.players.reduce(
        (n, r) => (n === null || r.totalTime > n.totalTime ? r : n),
        null
      );
      return t != null ? t.getPosition() : 0;
    }
    beforeDestroy() {
      this.players.forEach((t) => {
        t.beforeDestroy && t.beforeDestroy();
      });
    }
    triggerCallback(t) {
      let n = t == 'start' ? this._onStartFns : this._onDoneFns;
      n.forEach((r) => r()), (n.length = 0);
    }
  },
  bx = '!';
export {
  Oe as a,
  Fe as b,
  xD as c,
  SD as d,
  TD as e,
  kd as f,
  k as g,
  Wd as h,
  M as i,
  So as j,
  To as k,
  re as l,
  Zt as m,
  Ye as n,
  pe as o,
  nf as p,
  rf as q,
  of as r,
  Ke as s,
  Ce as t,
  hf as u,
  be as v,
  Jt as w,
  Qn as x,
  gf as y,
  mf as z,
  Ao as A,
  Cf as B,
  Je as C,
  bf as D,
  Za as E,
  _f as F,
  Mf as G,
  xf as H,
  Xt as I,
  Oo as J,
  Sf as K,
  Tf as L,
  Of as M,
  Ya as N,
  Fo as O,
  Ff as P,
  Rf as Q,
  Po as R,
  Pf as S,
  kf as T,
  Lf as U,
  jf as V,
  Vf as W,
  Bf as X,
  S as Y,
  Vu as Z,
  P as _,
  $u as $,
  BM as aa,
  A as ba,
  _ as ca,
  U as da,
  x as ea,
  ah as fa,
  uh as ga,
  rn as ha,
  $M as ia,
  tc as ja,
  Th as ka,
  Oh as la,
  dc as ma,
  Ve as na,
  zh as oa,
  Gh as pa,
  mc as qa,
  HM as ra,
  UM as sa,
  zM as ta,
  GM as ua,
  WM as va,
  Fp as wa,
  ut as xa,
  Cs as ya,
  Kr as za,
  de as Aa,
  X as Ba,
  Ft as Ca,
  Ht as Da,
  mi as Ea,
  qM as Fa,
  ZM as Ga,
  Xp as Ha,
  Ms as Ia,
  YM as Ja,
  QM as Ka,
  gn as La,
  rl as Ma,
  KM as Na,
  JM as Oa,
  XM as Pa,
  e0 as Qa,
  t0 as Ra,
  ol as Sa,
  n0 as Ta,
  Ss as Ua,
  r0 as Va,
  xr as Wa,
  o0 as Xa,
  Ut as Ya,
  i0 as Za,
  ln as _a,
  kt as $a,
  Ar as ab,
  Wl as bb,
  Ge as cb,
  K as db,
  Gm as eb,
  io as fb,
  c0 as gb,
  wy as hb,
  Sy as ib,
  Bi as jb,
  Ty as kb,
  ky as lb,
  Vy as mb,
  Jy as nb,
  nd as ob,
  Xy as pb,
  l0 as qb,
  d0 as rb,
  f0 as sb,
  h0 as tb,
  p0 as ub,
  ud as vb,
  cd as wb,
  pv as xb,
  yv as yb,
  g0 as zb,
  Dv as Ab,
  Iv as Bb,
  bv as Cb,
  _v as Db,
  m0 as Eb,
  y0 as Fb,
  v0 as Gb,
  D0 as Hb,
  I0 as Ib,
  E0 as Jb,
  w0 as Kb,
  C0 as Lb,
  b0 as Mb,
  Av as Nb,
  fd as Ob,
  Ov as Pb,
  Fv as Qb,
  _0 as Rb,
  Rv as Sb,
  M0 as Tb,
  x0 as Ub,
  S0 as Vb,
  T0 as Wb,
  N0 as Xb,
  so as Yb,
  Gv as Zb,
  Wv as _b,
  ao as $b,
  A0 as ac,
  O0 as bc,
  qs as cc,
  vd as dc,
  F0 as ec,
  R0 as fc,
  dD as gc,
  fD as hc,
  P0 as ic,
  Zs as jc,
  k0 as kc,
  Qs as lc,
  ax as mc,
  Dd as nc,
  ta as oc,
  ux as pc,
  uo as qc,
  gD as rc,
  cx as sc,
  mD as tc,
  lx as uc,
  dx as vc,
  fx as wc,
  CD as xc,
  _D as yc,
  hx as zc,
  px as Ac,
  wd as Bc,
  ft as Cc,
  yx as Dc,
  vx as Ec,
  Dx as Fc,
  Ix as Gc,
  Ex as Hc,
  wx as Ic,
  Cx as Jc,
  _d as Kc,
  Md as Lc,
  bx as Mc,
};
