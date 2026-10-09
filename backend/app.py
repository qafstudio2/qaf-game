"""Minimal WSGI count API. Run behind owned HTTPS proxy; no private website routes."""
import json, os, time, threading
from collections import deque
from count_store import CountStore

class CountAPI:
    def __init__(self, store, origins):
        self.store=store;self.origins=set(origins);self.recent=deque();self.lock=threading.Lock()
    def __call__(self, env, start_response):
        origin=env.get('HTTP_ORIGIN','');method=env.get('REQUEST_METHOD','GET');path=env.get('PATH_INFO','')
        headers=[('Content-Type','application/json; charset=utf-8'),('Cache-Control','no-store'),('Vary','Origin')]
        def out(status,obj):
            body=json.dumps(obj).encode();start_response(status,headers+[('Content-Length',str(len(body)))]);return [body]
        if origin not in self.origins:return out('403 Forbidden',{'error':'origin not allowed'})
        headers.append(('Access-Control-Allow-Origin',origin))
        if method=='OPTIONS':
            headers.extend([('Access-Control-Allow-Methods','GET, POST, OPTIONS'),('Access-Control-Allow-Headers','Content-Type')]);return out('200 OK',{})
        if method=='GET' and path=='/counts':return out('200 OK',{'counts':self.store.counts()})
        if method!='POST' or path!='/plays':return out('404 Not Found',{'error':'not found'})
        if env.get('CONTENT_TYPE','').split(';')[0]!='application/json':return out('415 Unsupported Media Type',{'error':'JSON required'})
        try:size=int(env.get('CONTENT_LENGTH','0'))
        except ValueError:return out('400 Bad Request',{'error':'invalid length'})
        if size<1 or size>1024:return out('413 Content Too Large',{'error':'invalid size'})
        with self.lock:
            now=time.monotonic()
            while self.recent and now-self.recent[0]>=60:self.recent.popleft()
            if len(self.recent)>=120:return out('429 Too Many Requests',{'error':'busy'})
            self.recent.append(now)
        try:
            data=json.loads(env['wsgi.input'].read(size))
            if not isinstance(data,dict) or set(data)!={'gameId','eventId'}:raise ValueError()
            if not all(isinstance(data[k],str) for k in data):raise ValueError()
            return out('200 OK',self.store.start(data['gameId'],data['eventId']))
        except (ValueError,TypeError,AttributeError,json.JSONDecodeError):return out('400 Bad Request',{'error':'invalid event'})

# Import has no side effects. Deployment must explicitly provide persistent DB path.
def create_app(db_path, origins=('https://qafstudio2.github.io',)):
    return CountAPI(CountStore(db_path), origins)
