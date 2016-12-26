import { NualamakPage } from './app.po';

describe('nualamak App', function() {
  let page: NualamakPage;

  beforeEach(() => {
    page = new NualamakPage();
  });

  it('should display messageService saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
