class Queue {
  constructor() {
    this.items = {};
    this.start = 0;
    this.end = 0;
    this.count = 0;
  }

  enqueue(item) {
    this.items[this.end] = item;
    this.end++;
    this.count = this.count + 1;
  }

  dequeue() {
    const item = this.items[this.start];
    delete this.items[this.start];
    this.start++;
    this.count = this.count - 1;
    return item;
  }

  printQueue() {
    return this.items;
  }

  printAllObject() {
    for (const [key, value] of Object.entries(this.items)) {
      console.log(key, value);
    }
  }
}

export { Queue };
