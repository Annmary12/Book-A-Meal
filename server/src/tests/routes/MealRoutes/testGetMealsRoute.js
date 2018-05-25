import {
  chai,
  App,
  adminToken
} from '../../setup'

describe('GET /api/v1/meals', function() {
	it('should return a success status', async function(){
		const res = await chai.request(App).get('/api/v1/meals')
													.set('Authorization',  `Bearer ${adminToken}`);
		res.should.have.status(200);
	})
});