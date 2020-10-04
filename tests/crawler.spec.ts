import {crawl} from '../src/crawler'

test(`test extract`, () => {

    const projectDir = './tests/fixtures';
    const result = crawl({projectDir})

    expect(result).toMatchSnapshot();
})
