class Stack:
    def __init__(self):
        """
        Initializes an empty stack.
        """
        self.items = []

    def push(self, item):
        """
        Adds an item to the top of the stack.
        """
        self.items.append(item)
        print(f"Pushed: {item}")

    def pop(self):
        """
        Removes and returns the item from the top of the stack.
        Returns None if the stack is empty.
        """
        if not self.is_empty():
            popped_item = self.items.pop()
            print(f"Popped: {popped_item}")
            return popped_item
        else:
            print("Stack is empty. Cannot pop.")
            return None

    def peek(self):
        """
        Returns the item at the top of the stack without removing it.
        Returns None if the stack is empty.
        """
        if not self.is_empty():
            return self.items[-1]
        else:
            print("Stack is empty. No item to peek.")
            return None

    def is_empty(self):
        """
        Checks if the stack is empty.
        Returns True if empty, False otherwise.
        """
        return len(self.items) == 0

    def size(self):
        """
        Returns the number of items in the stack.
        """
        return len(self.items)

# Example usage of the Stack
if __name__ == "__main__":
    my_stack = Stack()

    print(f"Is stack empty? {my_stack.is_empty()}")

    my_stack.push(10)
    my_stack.push(20)
    my_stack.push(30)

    print(f"Stack size: {my_stack.size()}")
    print(f"Top element: {my_stack.peek()}")

    my_stack.pop()
    my_stack.pop()

    print(f"Stack size after pops: {my_stack.size()}")
    print(f"Is stack empty? {my_stack.is_empty()}")

    my_stack.pop()
    my_stack.pop() # Attempting to pop from an empty stack