// Test script to demonstrate URL length protection
// This simulates what happens in the app when URL gets too long
// running instructions from root folder:
// cd /home/avi/Documents/Study/React/pwa-autofocus-app && node test-url-length.js

const MAX_URL_LENGTH = 8000;

// Simulate the app's serialize function
const serializeListStateToQueryString = (listState) => {
  const serializedState = btoa(encodeURIComponent(JSON.stringify(listState)));
  const queryString = `?list=${serializedState}`;
  
  // Simulate full URL (using a fake origin)
  const fullUrl = 'https://example.com/pwa-autofocus-app' + queryString;
  
  console.log(`URL length: ${fullUrl.length} characters`);
  
  if (fullUrl.length > MAX_URL_LENGTH) {
    throw new Error('URL_TOO_LONG');
  }
  
  return queryString;
};

// Test with a small list
console.log('=== Testing with small list ===');
const smallList = [
  { id: 1, text: 'Task 1', done: false },
  { id: 2, text: 'Task 2', done: false }
];

try {
  const queryString = serializeListStateToQueryString(smallList);
  console.log('✓ Small list: URL creation successful');
  console.log(`Query string: ${queryString.substring(0, 100)}...`);
} catch (error) {
  console.log('✗ Small list: Failed -', error.message);
}

// Test with a large list
console.log('\n=== Testing with large list ===');
const largeList = [];
for (let i = 1; i <= 50; i++) {
  largeList.push({
    id: i,
    text: `This is a very long task description that takes up a lot of space in the URL when encoded. Task number ${i} with lots of extra text to make it really long and cause URL length issues when base64 encoded and put into query parameters.`,
    done: false
  });
}

try {
  const queryString = serializeListStateToQueryString(largeList);
  console.log('✓ Large list: URL creation successful');
  console.log(`Query string: ${queryString}`);
} catch (error) {
  console.log(`✗ Large list: Failed - ${error.message}`);
  console.log('This is the expected behavior - app will show error message to user');
}

console.log(`\nLarge list JSON length: ${JSON.stringify(largeList).length} characters`);
console.log(`Large list base64 length: ${btoa(encodeURIComponent(JSON.stringify(largeList))).length} characters`);
