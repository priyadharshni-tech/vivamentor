import { AgentMetadata, ConceptExplanation, ResearchAnalysis } from '../types/agent';

export const AGENT_REGISTRY: AgentMetadata[] = [
  {
    id: 'vivamentor',
    name: 'VivaMentor',
    badgeTitle: 'Supervisor & Viva Examiner',
    tagline: 'AI Mock Viva Examiner & Multi-Agent Orchestrator',
    icon: 'GraduationCap',
    color: '#2563EB',
    accentBg: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Conducts intelligent viva examinations, evaluates answers, scores performance, asks adaptive follow-up questions, and coordinates sub-agents.'
  },
  {
    id: 'conceptguru',
    name: 'ConceptGuru',
    badgeTitle: 'Technical Concept Explainer',
    tagline: 'Deep Intuitive Explanations, Analogies & Interactive Diagrams',
    icon: 'Lightbulb',
    color: '#D97706',
    accentBg: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Transforms complex Computer Science concepts into clear mental models with real-world analogies, interactive flowcharts, code implementations, and quizzes.'
  },
  {
    id: 'codedoctor',
    name: 'CodeDoctor',
    badgeTitle: 'Code Review & Debugger',
    tagline: 'Bug Detection, Complexity Analysis & Code Refactoring',
    icon: 'Code2',
    color: '#059669',
    accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Finds bugs in Java, Python, C++, and JavaScript code, provides side-by-side refactoring diffs, time/space complexity cards, and line-by-line fix guides.'
  },
  {
    id: 'resumecraft',
    name: 'ResumeCraft',
    badgeTitle: 'Resume & ATS Analyzer',
    tagline: 'ATS Score Gauge, Bullet Rewriter & Resume Enhancer',
    icon: 'FileText',
    color: '#9333EA',
    accentBg: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Parses student resumes, calculates ATS job match percentage, identifies missing keywords, rewrites weak bullets with quantifiable impact, and formats templates.'
  },
  {
    id: 'interviewace',
    name: 'InterviewAce',
    badgeTitle: 'HR + Technical Coach',
    tagline: 'STAR Method Evaluator & Real-Time Interview Simulation',
    icon: 'Mic',
    color: '#DC2626',
    accentBg: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Simulates high-stakes company interview rounds, evaluates answers using the STAR method, analyzes communication clarity, and tracks confidence metrics.'
  },
  {
    id: 'researchpilot',
    name: 'ResearchPilot',
    badgeTitle: 'Research Assistant',
    tagline: 'Literature Surveys, IEEE Paper Summaries & Citations',
    icon: 'BookOpen',
    color: '#0891B2',
    accentBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: 'Assists with final year projects and IEEE paper reading by extracting literature matrices, detecting research gaps, generating citations, and structuring roadmaps.'
  }
];

export const DEMO_CONCEPT_GRAPH: Record<string, ConceptExplanation> = {
  'garbage collection': {
    topic: 'Garbage Collection in Java',
    difficulty: 'Intermediate',
    analogy: 'Imagine a busy restaurant dining hall. Customers eat and leave empty plates on tables. The Garbage Collector is like the automated cleaning crew that identifies unused tables (unreachable objects in heap memory) and sweeps them clean so new guests (new allocations) can sit without expanding the restaurant building.',
    simpleExplanation: 'Garbage Collection (GC) in Java is an automatic memory management feature that frees up heap space occupied by unreferenced objects, preventing OutOfMemoryError exceptions without requiring manual delete/free commands.',
    technicalDetails: 'Java GC divides heap memory into Young Generation (Eden, S1, S2) and Tenured (Old) Generation. Minor GC collects dead objects in Eden and copies survivors to Survivor spaces. When objects survive enough GC cycles, they are promoted to Old Gen where Major/Full GC occurs using Mark-Sweep-Compact algorithms.',
    nodes: [
      { id: '1', label: 'Object Created in Eden Space', description: 'new MyObject() allocates memory in Young Gen Eden space.', type: 'start', connectedTo: ['2'] },
      { id: '2', label: 'Is Reference Active?', description: 'Checks if any active stack frame or root reference points to this object.', type: 'decision', connectedTo: ['3', '4'] },
      { id: '3', label: 'Object Retained / Promoted', description: 'Survives Minor GC cycles and moves from Eden to Survivor S1/S2 to Old Gen.', type: 'process' },
      { id: '4', label: 'Marked for Sweeping', description: 'Unreachable object detected. Memory reclaimed during next GC sweep.', type: 'end' }
    ],
    codeExample: {
      language: 'java',
      code: `public class MemoryDemo {\n    public static void main(String[] args) {\n        DataChunk chunk = new DataChunk("Temp Data");\n        chunk = null; // Unreachable now!\n        System.gc(); // Suggest GC execution\n    }\n}`,
      explanation: 'Setting chunk = null drops the reference on the stack. The DataChunk object becomes unreferenced in the heap, marking it for Mark-and-Sweep collection.'
    },
    quiz: [
      { question: 'Which area of JVM Heap memory receives newly created objects first?', options: ['Survivor S1', 'Tenured / Old Generation', 'Eden Space', 'Metaspace'], correctIndex: 2, explanation: 'Newly instantiated objects are always allocated in the Eden space of the Young Generation.' },
      { question: 'Does calling System.gc() guarantee immediate garbage collection?', options: ['Yes, always forces immediate cleanup', 'No, it is only a suggestion to JVM', 'It terminates the program', 'Only in Java 17+'], correctIndex: 1, explanation: 'System.gc() is a recommendation to the JVM. The JVM decides when it is optimal to execute GC.' },
      { question: 'What algorithm is often used for Full GC?', options: ['Bubble Sort', 'Mark-Sweep-Compact', 'Round Robin', 'Dijkstra'], correctIndex: 1, explanation: 'Mark-Sweep-Compact marks live objects, sweeps dead ones, and compacts memory to prevent fragmentation.' }
    ],
    interviewQuestions: [
      'What is the difference between Minor GC, Major GC, and Full GC?',
      'How does G1 Garbage Collector differ from CMS and Parallel GC?',
      'What are Garbage Collection Roots (GC Roots) in Java?',
      'How does a memory leak happen in Java if GC is automatic?'
    ],
    commonMisconceptions: [
      'Misconception: Setting an object to null instantly deletes it from RAM.',
      'Misconception: Garbage Collection prevents memory leaks entirely.',
      'Misconception: System.gc() forces the garbage collector to run immediately.'
    ]
  },
  'b-trees': {
    topic: 'B-Trees',
    difficulty: 'Hard',
    analogy: 'Think of a B-Tree like a heavily structured corporate filing cabinet. Instead of opening a drawer (disk read) for just one file, you pull out a whole folder containing multiple sorted files (keys). You navigate through these folders hierarchically to find exactly what you need with very few drawer openings.',
    simpleExplanation: 'A B-Tree is a self-balancing search tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in logarithmic time. It is highly optimized for systems that read and write large blocks of data, like databases and file systems.',
    technicalDetails: 'B-trees minimize disk I/O operations by storing multiple keys in a single node, increasing the branching factor. Every internal node contains at most m children and at least ceil(m/2) children. This keeps the tree shallow, guaranteeing O(log n) time complexity for search, insert, and delete.',
    nodes: [
      { id: '1', label: 'Start at Root', description: 'Read the root node from memory.', type: 'start', connectedTo: ['2'] },
      { id: '2', label: 'Find Range', description: 'Compare target key with node keys to find the correct child pointer.', type: 'decision', connectedTo: ['3', '4'] },
      { id: '3', label: 'Follow Pointer', description: 'Load the child node from disk.', type: 'process', connectedTo: ['2'] },
      { id: '4', label: 'Key Found / Not Found', description: 'Return data or null.', type: 'end' }
    ],
    codeExample: {
      language: 'cpp',
      code: `// B-Tree Node structure sketch\nstruct BTreeNode {\n    int *keys; // array of keys\n    int t; // minimum degree\n    BTreeNode **C; // array of child pointers\n    int n; // current number of keys\n    bool leaf; // true if leaf node\n};`,
      explanation: 'A B-Tree node holds an array of keys and an array of pointers to its children. The degree "t" dictates the min/max number of keys.'
    },
    quiz: [
      { question: 'Why are B-trees commonly used in databases?', options: ['They use less memory', 'They minimize disk I/O', 'They are easy to implement', 'They sort data in O(1) time'], correctIndex: 1, explanation: 'Databases are stored on disk, and disk I/O is slow. B-trees load large blocks of data at once to minimize these slow reads.' },
      { question: 'What is the time complexity of searching in a B-Tree?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'], correctIndex: 2, explanation: 'Because it is a balanced tree, the height is bounded logarithmically, giving O(log n) search time.' },
      { question: 'Can a B-tree node have more than 2 children?', options: ['No, only binary trees do', 'Yes, that is the defining feature', 'Only in Java', 'Only leaf nodes'], correctIndex: 1, explanation: 'B-trees typically have a high branching factor, meaning a single node can have tens or hundreds of children.' }
    ],
    interviewQuestions: [
      'Compare B-Trees with Binary Search Trees (BST).',
      'What is the difference between a B-Tree and a B+ Tree?',
      'How does splitting work when inserting into a full node in a B-Tree?',
      'Why is the minimum degree "t" important in a B-tree?'
    ],
    commonMisconceptions: [
      'Misconception: B-trees are the same as Binary Trees.',
      'Misconception: B-trees only store data in the leaves (That is a B+ tree!).',
      'Misconception: B-trees are only used for in-memory data structures.'
    ]
  },
  'event loop': {
    topic: 'Node.js Event Loop',
    difficulty: 'Medium',
    analogy: 'Imagine a busy waiter in a restaurant. The waiter takes an order, passes it to the kitchen (database/API), and instead of waiting for the food, immediately goes to take another table\'s order. When the kitchen rings the bell (callback), the waiter serves the food. The waiter is the Event Loop, and the kitchen is the asynchronous worker pool.',
    simpleExplanation: 'The Event Loop is what allows Node.js to perform non-blocking I/O operations despite being single-threaded. It delegates heavy tasks to the system kernel (or worker threads) and executes callbacks when those tasks complete.',
    technicalDetails: 'The Node.js event loop runs continuously and has several phases: Timers (setTimeout, setInterval), Pending Callbacks, Idle/Prepare, Poll (retrieve new I/O events), Check (setImmediate), and Close Callbacks. Microtasks (Promises, process.nextTick) are executed immediately after the current operation completes, before moving to the next phase.',
    nodes: [
      { id: '1', label: 'Timers Phase', description: 'Executes callbacks scheduled by setTimeout() and setInterval().', type: 'process', connectedTo: ['2'] },
      { id: '2', label: 'Poll Phase', description: 'Retrieves new I/O events; executes I/O related callbacks.', type: 'process', connectedTo: ['3'] },
      { id: '3', label: 'Check Phase', description: 'Executes callbacks scheduled by setImmediate().', type: 'process', connectedTo: ['4'] },
      { id: '4', label: 'Close Callbacks', description: 'Executes close events, e.g., socket.on(\'close\').', type: 'end' }
    ],
    codeExample: {
      language: 'javascript',
      code: `console.log('1. Start');\nsetTimeout(() => console.log('4. Timer'), 0);\nPromise.resolve().then(() => console.log('3. Promise'));\nconsole.log('2. End');`,
      explanation: 'Synchronous code runs first (1, 2). Then the microtask queue (Promise) runs (3). Finally, the macrotask queue (setTimeout) runs (4).'
    },
    quiz: [
      { question: 'Which queue has the highest priority in the Event Loop?', options: ['Timers Queue', 'I/O Queue', 'Microtask Queue (process.nextTick)', 'Check Queue'], correctIndex: 2, explanation: 'process.nextTick and Promise callbacks (microtasks) run before the event loop continues to the next phase.' },
      { question: 'Is Node.js completely single-threaded?', options: ['Yes', 'No, libuv uses a thread pool for I/O', 'Only on Windows', 'No, JavaScript is multi-threaded'], correctIndex: 1, explanation: 'While the event loop is single-threaded, underlying C++ APIs (libuv) use a thread pool for file system and crypto operations.' },
      { question: 'When does setImmediate() run?', options: ['Before setTimeout', 'After the poll phase (Check phase)', 'Immediately, blocking everything', 'Never'], correctIndex: 1, explanation: 'setImmediate callbacks are executed in the Check phase, right after the Poll phase completes.' }
    ],
    interviewQuestions: [
      'Explain the difference between process.nextTick() and setImmediate().',
      'What happens if you run an infinite while loop in Node.js?',
      'How does the Event Loop handle multiple concurrent HTTP requests?',
      'What are microtasks and macrotasks?'
    ],
    commonMisconceptions: [
      'Misconception: Node.js is slow because it is single-threaded.',
      'Misconception: setTimeout(fn, 0) runs exactly at 0 milliseconds.',
      'Misconception: Promises run in the Timers phase.'
    ]
  },
  'oop polymorphism': {
    topic: 'Object-Oriented Polymorphism',
    difficulty: 'Easy',
    analogy: 'Think of a universal TV remote. You press the "Power" button, and it turns on the device. But what it actually does depends on the device it\'s pointed at: a TV, a soundbar, or a DVD player. The action is the same ("Power"), but the implementation differs based on the object.',
    simpleExplanation: 'Polymorphism allows objects of different classes to be treated as objects of a common superclass. It lets you write code that can handle various types of objects uniformly, relying on the specific object to define its own behavior.',
    technicalDetails: 'There are two main types: Compile-time polymorphism (Method Overloading - same method name, different parameters) and Run-time polymorphism (Method Overriding - subclass redefines a method from its superclass). Run-time polymorphism is achieved via dynamic method dispatch using interfaces or abstract classes.',
    nodes: [
      { id: '1', label: 'Define Interface', description: 'e.g., Animal with makeSound() method.', type: 'start', connectedTo: ['2'] },
      { id: '2', label: 'Implement Classes', description: 'Dog and Cat classes implement Animal.', type: 'process', connectedTo: ['3'] },
      { id: '3', label: 'Call Method', description: 'Call makeSound() on an Animal reference.', type: 'decision', connectedTo: ['4'] },
      { id: '4', label: 'Dynamic Dispatch', description: 'JVM determines at runtime whether to bark or meow.', type: 'end' }
    ],
    codeExample: {
      language: 'java',
      code: `class Animal { void sound() { System.out.println("Generic"); } }\nclass Dog extends Animal { void sound() { System.out.println("Bark"); } }\nclass Cat extends Animal { void sound() { System.out.println("Meow"); } }\n\nAnimal myPet = new Dog();\nmyPet.sound(); // Output: Bark`,
      explanation: 'Even though the reference is of type Animal, the actual object is a Dog. At runtime, the JVM dynamically dispatches the call to the Dog\'s overridden sound method.'
    },
    quiz: [
      { question: 'Which of the following is an example of compile-time polymorphism?', options: ['Method Overriding', 'Method Overloading', 'Interfaces', 'Abstract Classes'], correctIndex: 1, explanation: 'Method overloading is resolved by the compiler based on the method signature.' },
      { question: 'What enables run-time polymorphism in Java?', options: ['Static binding', 'Dynamic binding / method dispatch', 'Constructors', 'Final methods'], correctIndex: 1, explanation: 'Dynamic binding determines which overridden method to call at runtime based on the actual object type.' },
      { question: 'Can you override a private method?', options: ['Yes', 'No', 'Only in C++', 'Only if it has no arguments'], correctIndex: 1, explanation: 'Private methods belong to the class and are not visible to subclasses, so they cannot be overridden.' }
    ],
    interviewQuestions: [
      'What is the difference between overloading and overriding?',
      'How does polymorphism help in writing maintainable code?',
      'Can static methods be overridden in Java?',
      'Explain dynamic method dispatch.'
    ],
    commonMisconceptions: [
      'Misconception: Overloading and Overriding are the exact same thing.',
      'Misconception: Polymorphism only applies to classes, not interfaces.',
      'Misconception: A subclass must override all methods of a superclass (only abstract methods are required).'
    ]
  },
  'linked lists': {
    topic: 'Linked Lists',
    difficulty: 'Easy',
    analogy: 'Imagine a treasure hunt. You find a clue (the data) and instructions on where to find the next clue (the pointer). You don\'t know where all the clues are at the start; you must go from one to the next sequentially to finish the hunt.',
    simpleExplanation: 'A Linked List is a linear data structure where elements are not stored in contiguous memory locations. Instead, each element (node) contains data and a reference (link or pointer) to the next node in the sequence.',
    technicalDetails: 'Unlike arrays, linked lists can easily grow and shrink in size dynamically. Insertions and deletions can be O(1) if the node reference is known. However, accessing an element by index takes O(n) time because you must traverse the list from the head. Variations include Singly, Doubly, and Circular linked lists.',
    nodes: [
      { id: '1', label: 'Head Node', description: 'The starting point of the list.', type: 'start', connectedTo: ['2'] },
      { id: '2', label: 'Data', description: 'The value stored in the node.', type: 'process', connectedTo: ['3'] },
      { id: '3', label: 'Next Pointer', description: 'Memory address of the next node.', type: 'decision', connectedTo: ['2', '4'] },
      { id: '4', label: 'Null Reference', description: 'Indicates the end of the list.', type: 'end' }
    ],
    codeExample: {
      language: 'cpp',
      code: `struct Node {\n    int data;\n    Node* next;\n};\n\nNode* head = new Node();\nhead->data = 1;\nhead->next = nullptr;`,
      explanation: 'A basic singly linked list node in C++. It stores an integer and a pointer to the next Node object.'
    },
    quiz: [
      { question: 'What is the time complexity of accessing the nth element in a singly linked list?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctIndex: 2, explanation: 'You must start at the head and traverse n nodes to reach the nth element.' },
      { question: 'Which operation is faster in a linked list compared to an array?', options: ['Random access', 'Binary search', 'Insertion/Deletion at the beginning', 'Sorting'], correctIndex: 2, explanation: 'Inserting at the beginning of a linked list is O(1), whereas in an array, it requires shifting all elements O(n).' },
      { question: 'What does a doubly linked list node contain that a singly linked list node does not?', options: ['Data', 'A pointer to the next node', 'A pointer to the previous node', 'A head pointer'], correctIndex: 2, explanation: 'Doubly linked lists have references to both the next and previous nodes.' }
    ],
    interviewQuestions: [
      'How do you detect a cycle in a linked list? (Floyd\'s Cycle-Finding Algorithm)',
      'How would you reverse a linked list?',
      'Explain the difference between an Array and a Linked List.',
      'How do you find the middle element of a linked list in one pass?'
    ],
    commonMisconceptions: [
      'Misconception: Linked lists use less memory than arrays (they use more due to pointers!).',
      'Misconception: Linked lists are always faster than arrays.',
      'Misconception: You can perform binary search efficiently on a linked list.'
    ]
  },
  'sql joins': {
    topic: 'SQL Joins',
    difficulty: 'Medium',
    analogy: 'Imagine two lists: one with Employee names and their Department IDs, and another with Department IDs and Department names. A JOIN is like finding matching IDs across the two lists and gluing them together side-by-side to see which employee works in which department.',
    simpleExplanation: 'A SQL JOIN clause is used to combine rows from two or more tables based on a related column between them. It allows you to query data across multiple tables as if they were a single table.',
    technicalDetails: 'Types of JOINs: INNER JOIN (returns records with matching values in both tables), LEFT JOIN (returns all records from the left table, and matched records from the right), RIGHT JOIN (opposite of LEFT), and FULL OUTER JOIN (returns all records when there is a match in either table).',
    nodes: [
      { id: '1', label: 'Select Tables', description: 'Identify the left (Table A) and right (Table B) tables.', type: 'start', connectedTo: ['2'] },
      { id: '2', label: 'Specify Join Type', description: 'INNER, LEFT, RIGHT, or FULL.', type: 'decision', connectedTo: ['3'] },
      { id: '3', label: 'Define ON Condition', description: 'State how the tables relate (e.g., A.id = B.a_id).', type: 'process', connectedTo: ['4'] },
      { id: '4', label: 'Result Set Generated', description: 'Combined rows are returned.', type: 'end' }
    ],
    codeExample: {
      language: 'sql',
      code: `SELECT Employees.Name, Departments.DepartmentName\nFROM Employees\nINNER JOIN Departments \nON Employees.DepartmentID = Departments.DepartmentID;`,
      explanation: 'This INNER JOIN retrieves only the employees who are assigned to a department, linking them by DepartmentID.'
    },
    quiz: [
      { question: 'Which JOIN returns all rows from the left table, even if there are no matches in the right table?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], correctIndex: 1, explanation: 'LEFT JOIN keeps all left records and puts NULLs for missing right records.' },
      { question: 'What happens if you use a CROSS JOIN?', options: ['It joins tables without a condition (Cartesian product)', 'It only returns matched rows', 'It is the same as an INNER JOIN', 'It deletes data'], correctIndex: 0, explanation: 'A CROSS JOIN produces the Cartesian product, multiplying every row in table A with every row in table B.' },
      { question: 'An INNER JOIN is most similar to which set operation?', options: ['Union', 'Intersection', 'Difference', 'Subset'], correctIndex: 1, explanation: 'INNER JOIN acts like a set intersection, returning only records that exist in both tables.' }
    ],
    interviewQuestions: [
      'What is the difference between an INNER JOIN and a LEFT JOIN?',
      'Can you join a table to itself? (Self Join)',
      'What is a Full Outer Join and when would you use it?',
      'How does an index affect the performance of a JOIN?'
    ],
    commonMisconceptions: [
      'Misconception: You can only join two tables at a time (you can chain many JOINs).',
      'Misconception: JOINs and UNIONs are the same thing.',
      'Misconception: LEFT JOIN and LEFT OUTER JOIN are different (they are synonymous).'
    ]
  }
};

export const DEMO_CODE_DOCTOR_SAMPLES = {
  java: `public class ArraySearch {
    public static int findTarget(int[] nums, int target) {
        for (int i = 0; i <= nums.length; i++) { // Bug: Array Index Out Of Bounds
            if (nums[i] == target) {
                return i;
            }
        }
        return -1;
    }
}`,
  python: `def calculate_average(scores):
    total = 0
    for score in scores:
        total += score
    return total / len(scores) # Bug: DivisionByZero when scores list is empty!`,
  javascript: `async function fetchUserData(userId) {
    const user = fetch('/api/users/' + userId); // Bug: Missing await on fetch promise!
    console.log(user.name); // Returns undefined
    return user;
}`,
  cpp: `void printArray(int* arr) {
    int size = sizeof(arr) / sizeof(arr[0]); // Bug: sizeof on pointer returns size of pointer, not array!
    for(int i=0; i<size; i++) {
        cout << arr[i] << endl;
    }
}`,
  c: `#include <stdio.h>
#include <string.h>
int main() {
    char buffer[10];
    strcpy(buffer, "This string is way too long for the buffer"); // Bug: Buffer overflow!
    printf("%s", buffer);
    return 0;
}`
};

export const DEMO_INTERVIEW_QUESTIONS: Record<string, {question: string, category: string}[]> = {
  'HR': [
    { question: 'Tell me about yourself and your background.', category: 'Introduction' },
    { question: 'Why do you want to work at this company?', category: 'Motivation' },
    { question: 'Where do you see yourself in 5 years?', category: 'Career Goals' },
    { question: 'What is your greatest weakness?', category: 'Self-Awareness' },
    { question: 'Why should we hire you over other candidates?', category: 'Value Proposition' }
  ],
  'Technical': [
    { question: 'Explain the difference between REST and GraphQL.', category: 'Architecture' },
    { question: 'How would you design a scalable URL shortener like bit.ly?', category: 'System Design' },
    { question: 'What are the main principles of Object-Oriented Programming?', category: 'Fundamentals' },
    { question: 'Describe how a Hash Map works under the hood.', category: 'Data Structures' },
    { question: 'What is a race condition and how do you prevent it?', category: 'Concurrency' }
  ],
  'Behavioral': [
    { question: 'Tell me about a time you had a conflict with a team member.', category: 'Conflict Resolution' },
    { question: 'Describe a situation where you had to meet a tight deadline.', category: 'Time Management' },
    { question: 'Give an example of a time you failed and what you learned.', category: 'Growth Mindset' },
    { question: 'Tell me about a time you showed leadership.', category: 'Leadership' },
    { question: 'Describe a project you are particularly proud of.', category: 'Achievement' }
  ],
  'Company Specific': [
    { question: 'How do our products align with your technical skills?', category: 'Product Knowledge' },
    { question: 'What challenges do you think our industry will face in the next 3 years?', category: 'Industry Insight' },
    { question: 'How would you improve our current flagship application?', category: 'Innovation' },
    { question: 'Which of our core values resonates with you the most?', category: 'Cultural Fit' },
    { question: 'Have you used our API/SDK before? What was your experience?', category: 'Technical Experience' }
  ]
};

export const DEMO_RESEARCH_TOPICS: Record<string, ResearchAnalysis> = {
  'machine learning': {
    topic: 'Machine Learning for Early Disease Detection',
    domain: 'Healthcare & AI',
    novelIdeas: [
      'Federated Learning for Privacy-Preserving Patient Data Models',
      'Multi-modal MRI and Genetic Data Fusion',
      'Explainable AI (XAI) overlays for radiologist trust'
    ],
    summary: 'Research into Machine Learning for Healthcare focuses on building predictive models capable of identifying early markers of diseases like Alzheimer\'s and cancer from complex, multi-modal medical datasets.',
    literatureSurvey: [
      { id: 'ml-1', title: 'Deep Learning in Medical Image Analysis', authors: 'Litjens, G., et al.', year: 2017, methodology: 'CNN architectures for segmentation', limitations: 'Requires massive labeled datasets', keyResults: 'State-of-the-art accuracy in tumor detection.' },
      { id: 'ml-2', title: 'Explainable AI in Healthcare', authors: 'Holzinger, A., et al.', year: 2019, methodology: 'Post-hoc interpretability models', limitations: 'Trade-off between accuracy and explainability', keyResults: 'Improved clinical adoption rates by 30%.' }
    ],
    researchGaps: [
      'Lack of robustness in models when applied to diverse demographics.',
      'High latency in edge-device inference for real-time diagnostics.'
    ],
    projectRoadmap: [
      { phase: 'Phase 1: Data Collection', duration: '3 Weeks', milestone: 'Acquire MIMIC-III Dataset', deliverables: 'Cleaned and preprocessed dataset' },
      { phase: 'Phase 2: Model Training', duration: '4 Weeks', milestone: 'Train baseline ResNet model', deliverables: 'Trained model weights and validation metrics' },
      { phase: 'Phase 3: XAI Integration', duration: '3 Weeks', milestone: 'Implement Grad-CAM', deliverables: 'Visual heatmaps of model predictions' }
    ],
    citations: {
      ieee: `[1] G. Litjens et al., "A survey on deep learning in medical image analysis," Med. Image Anal., vol. 42, pp. 60-88, 2017.`,
      apa: `Litjens, G., et al. (2017). A survey on deep learning in medical image analysis. Medical Image Analysis, 42, 60-88.`,
      bibtex: `@article{litjens2017survey, title={A survey on deep learning in medical image analysis}, author={Litjens, G. and others}, journal={Medical image analysis}, volume={42}, pages={60--88}, year={2017} }`,
      mla: `Litjens, Geert, et al. "A survey on deep learning in medical image analysis." Medical image analysis 42 (2017): 60-88.`
    }
  },
  'iot': {
    topic: 'IoT Security in Smart Grids',
    domain: 'Internet of Things & Cybersecurity',
    novelIdeas: [
      'Blockchain-based distributed device authentication',
      'Lightweight encryption for low-power edge nodes',
      'AI-driven anomaly detection for DDoS attacks on grids'
    ],
    summary: 'Investigating the vulnerabilities of interconnected smart grid infrastructures and developing robust, low-latency security protocols to prevent catastrophic cyber-physical attacks.',
    literatureSurvey: [
      { id: 'iot-1', title: 'Security and Privacy in Smart Grids', authors: 'Wang, W., & Lu, Z.', year: 2013, methodology: 'Cryptographic key management review', limitations: 'Does not account for modern quantum threats', keyResults: 'Identified major SCADA vulnerabilities.' }
    ],
    researchGaps: [
      'High computational overhead of traditional encryption on constrained IoT devices.',
      'Lack of standardized cross-vendor security protocols.'
    ],
    projectRoadmap: [
      { phase: 'Phase 1: Vulnerability Assessment', duration: '2 Weeks', milestone: 'Simulate DDoS attack', deliverables: 'Threat vector analysis report' },
      { phase: 'Phase 2: Protocol Design', duration: '4 Weeks', milestone: 'Draft lightweight auth protocol', deliverables: 'Protocol specification document' },
      { phase: 'Phase 3: Simulation', duration: '4 Weeks', milestone: 'Run NS-3 network simulation', deliverables: 'Performance and latency metrics' }
    ],
    citations: {
      ieee: `[1] W. Wang and Z. Lu, "Cyber security in the Smart Grid: Survey and challenges," Comput. Netw., vol. 57, no. 5, pp. 1344-1371, 2013.`,
      apa: `Wang, W., & Lu, Z. (2013). Cyber security in the Smart Grid: Survey and challenges. Computer Networks, 57(5), 1344-1371.`,
      bibtex: `@article{wang2013cyber, title={Cyber security in the Smart Grid: Survey and challenges}, author={Wang, Wenye and Lu, Zhuo}, journal={Computer Networks}, volume={57}, number={5}, pages={1344--1371}, year={2013} }`,
      mla: `Wang, Wenye, and Zhuo Lu. "Cyber security in the Smart Grid: Survey and challenges." Computer Networks 57.5 (2013): 1344-1371.`
    }
  },
  'blockchain': {
    topic: 'Blockchain for Supply Chain Transparency',
    domain: 'Distributed Systems',
    novelIdeas: [
      'Zero-knowledge proofs for supplier privacy',
      'Integration of IoT RFID tags directly to Smart Contracts',
      'Energy-efficient consensus algorithms for tracking nodes'
    ],
    summary: 'Exploring how distributed ledger technology can create immutable, transparent, and traceable supply chains for the pharmaceutical industry to prevent counterfeit drugs.',
    literatureSurvey: [
      { id: 'bc-1', title: 'Blockchain technology and its relationships to sustainable supply chain management', authors: 'Saberi, S., et al.', year: 2019, methodology: 'Case study analysis', limitations: 'Limited quantitative data on implementation costs', keyResults: 'Proposed a conceptual framework for adoption.' }
    ],
    researchGaps: [
      'Scalability issues when handling millions of product scans per minute.',
      'Legal ambiguity regarding smart contract enforceability.'
    ],
    projectRoadmap: [
      { phase: 'Phase 1: Architecture Design', duration: '3 Weeks', milestone: 'Define Smart Contract Logic', deliverables: 'Solidity code drafts' },
      { phase: 'Phase 2: Network Setup', duration: '3 Weeks', milestone: 'Deploy Hyperledger Fabric testnet', deliverables: 'Running local blockchain network' },
      { phase: 'Phase 3: DApp Development', duration: '4 Weeks', milestone: 'Build tracking frontend', deliverables: 'Full-stack decentralized application (DApp)' }
    ],
    citations: {
      ieee: `[1] S. Saberi et al., "Blockchain technology and its relationships to sustainable supply chain management," Int. J. Prod. Res., vol. 57, no. 7, pp. 2117-2135, 2019.`,
      apa: `Saberi, S., Kouhizadeh, M., Sarkis, J., & Shen, L. (2019). Blockchain technology and its relationships to sustainable supply chain management. International Journal of Production Research, 57(7), 2117-2135.`,
      bibtex: `@article{saberi2019blockchain, title={Blockchain technology and its relationships to sustainable supply chain management}, author={Saberi, Sara and others}, journal={International Journal of Production Research}, volume={57}, number={7}, pages={2117--2135}, year={2019} }`,
      mla: `Saberi, Sara, et al. "Blockchain technology and its relationships to sustainable supply chain management." International Journal of Production Research 57.7 (2019): 2117-2135.`
    }
  }
};
