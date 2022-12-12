import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import useFetch from '../hooks/useFetch';

let container = null;

function fetchMock(url, suffix = '') {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        json: () => {
          console.log('fetchMock implementation');
          return Promise.resolve({
            data: url + suffix
          });
        },
        ok: true
      });
    }, 0)
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function TestComponent({ url }) {
  const { data, error } = useFetch(url);
  if (!data && !error) {
    return <div>loading</div>;
  }
  return <div>{data.data}</div>;
}

beforeAll(() => {
  jest.spyOn(global, 'fetch').mockImplementation(fetchMock);
});

afterAll(() => {
  global.fetch.mockClear();
});

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('Given a custom useFetch hook', () => {
  describe('when invoked', () => {
    it('should have a container', async () => {
      act(() => {
        render(<TestComponent url='test/mock' />, container);
      });
      expect(container).toBeInTheDocument;
    });

    it('should have loader while fetching data', async () => {
      act(() => {
        render(<TestComponent url='test/mock' />, container);
      });
      expect(container.textContent).toBe('loading');
    });

    it('should fetch data', async () => {
      act(() => {
        render(<TestComponent url='test/mock' />, container);
      });
      await act(() => sleep(0));
      expect(container.textContent).toBe('test/mock');
    });
  });
});
