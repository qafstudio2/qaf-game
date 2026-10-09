import tempfile, unittest, uuid
from concurrent.futures import ThreadPoolExecutor
from count_store import CountStore

class TestCounts(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.s=CountStore(self.tmp.name+'/counts.sqlite')
    def tearDown(self): self.tmp.cleanup()
    def test_new(self): self.assertEqual(self.s.counts(), {'hdmi':0,'aii':0})
    def test_duplicate(self):
        e=str(uuid.uuid4());self.s.start('aii',e);self.s.start('aii',e);self.assertEqual(self.s.counts()['aii'],1)
    def test_concurrent_duplicate(self):
        e=str(uuid.uuid4())
        with ThreadPoolExecutor(max_workers=8) as p:list(p.map(lambda _:self.s.start('hdmi',e),range(30)))
        self.assertEqual(self.s.counts()['hdmi'],1)
    def test_concurrent_distinct(self):
        with ThreadPoolExecutor(max_workers=8) as p:list(p.map(lambda _:self.s.start('hdmi',str(uuid.uuid4())),range(30)))
        self.assertEqual(self.s.counts()['hdmi'],30)
    def test_reject(self):
        for g,e in [('bad',str(uuid.uuid4())),('aii','bad')]:
            with self.assertRaises(ValueError):self.s.start(g,e)
        self.assertEqual(self.s.counts()['aii'],0)
    def test_cross_game_event(self):
        e=str(uuid.uuid4());self.s.start('aii',e)
        with self.assertRaises(ValueError):self.s.start('hdmi',e)
    def test_persistence(self):
        self.s.start('aii',str(uuid.uuid4()));self.assertEqual(CountStore(self.s.path).counts()['aii'],1)
if __name__=='__main__':unittest.main()
