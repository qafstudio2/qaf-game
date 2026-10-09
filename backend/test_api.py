import unittest,tempfile,io,json,uuid
from app import create_app
class API(unittest.TestCase):
 def setUp(self):self.t=tempfile.TemporaryDirectory();self.app=create_app(self.t.name+'/c.sqlite')
 def tearDown(self):self.t.cleanup()
 def call(self,method='GET',path='/counts',body=None,origin='https://qafstudio2.github.io'):
  data=json.dumps(body).encode() if body is not None else b'';result=[]
  env={'REQUEST_METHOD':method,'PATH_INFO':path,'HTTP_ORIGIN':origin,'CONTENT_TYPE':'application/json','CONTENT_LENGTH':str(len(data)),'wsgi.input':io.BytesIO(data)}
  raw=b''.join(self.app(env,lambda status,headers:result.extend([status,headers])))
  return result[0],json.loads(raw)
 def test_get(self):self.assertEqual(self.call()[1]['counts']['aii'],0)
 def test_denied_origin(self):self.assertEqual(self.call(origin='https://evil.test')[0],'403 Forbidden')
 def test_post_duplicate(self):
  d={'gameId':'aii','eventId':str(uuid.uuid4())}
  self.call('POST','/plays',d);self.call('POST','/plays',d);self.assertEqual(self.call()[1]['counts']['aii'],1)
 def test_private_routes_absent(self):self.assertEqual(self.call(path='/backups')[0],'404 Not Found')
 def test_bad_payload(self):self.assertEqual(self.call('POST','/plays',{'gameId':'aii','eventId':'bad','email':'x'})[0],'400 Bad Request')
 def test_options(self):self.assertEqual(self.call('OPTIONS','/plays')[0],'200 OK')
if __name__=='__main__':unittest.main()
