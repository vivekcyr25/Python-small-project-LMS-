import axios from 'axios';
import useAuthStore from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// -------------------------------------------------------------
// VIRTUAL MOCK DATABASE SEEDING
// -------------------------------------------------------------

const DEFAULT_COURSES = [
  {
    id: 1,
    title: 'Learning C Programming',
    slug: 'learning-c-programming',
    description: 'Unleash the power of system-level software engineering. Master pointers, compiler processes, data structures, and memory management through practical hands-on exercises in the C language.',
    thumbnail_url: '',
    level: 'Beginner',
    price: 0.00,
    is_published: true,
    instructor_id: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Advanced C: Pointers & Algorithms',
    slug: 'advanced-c-pointers',
    description: 'Unlock the depth of C by studying stack vs heap allocation, custom memory managers, function pointers, and designing data structures such as linked lists, hash maps, and binary search trees.',
    thumbnail_url: '',
    level: 'Advanced',
    price: 29.99,
    is_published: true,
    instructor_id: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Python Fundamentals & Automation',
    slug: 'python-fundamentals',
    description: 'Beginner-friendly introduction to Python variables, loops, object-oriented concepts, automation scripts, and working with APIs.',
    thumbnail_url: '',
    level: 'Beginner',
    price: 0.00,
    is_published: true,
    instructor_id: 2,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_MODULES = [
  // Learning C Modules
  { id: 101, course_id: 1, title: 'Module 1: Overview & Setup', order: 1 },
  { id: 102, course_id: 1, title: 'Module 2: Syntax & Basic Types', order: 2 },
  { id: 103, course_id: 1, title: 'Module 3: Control Flow & Decisions', order: 3 },
  { id: 104, course_id: 1, title: 'Module 4: Loops & Iterations', order: 4 },
  { id: 105, course_id: 1, title: 'Module 5: Functions & Modular Code', order: 5 },
  // Advanced C Modules
  { id: 201, course_id: 2, title: 'Module 1: Pointer Fundamentals', order: 1 },
  { id: 202, course_id: 2, title: 'Module 2: Dynamic Memory Management', order: 2 },
  // Python Modules
  { id: 301, course_id: 3, title: 'Module 1: Python Installation & Hello World', order: 1 }
];

const DEFAULT_LESSONS = [
  // Learning C Lessons
  { id: 1001, module_id: 101, title: 'Welcome to C!', order: 1, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'C is a compiled language designed in 1972 by Dennis Ritchie at Bell Labs. It has directly or indirectly influenced almost all modern languages like C++, Java, C#, and JavaScript.\n\nIn this lesson, we learn why C is still dominant in system software, embedded devices, operating systems, and high-performance game engines. You will write a basic skeleton of a main C function and understand the compilation steps: Preprocessing -> Compiling -> Assembly -> Linking.' },
  { id: 1002, module_id: 101, title: 'Setting Up GCC & Clang Compilers', order: 2, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'To write C programs, you need a compiler. On Windows, you can install MSYS2 to get the GCC compiler toolchain. On macOS, run `xcode-select --install` to obtain Clang. On Ubuntu/Debian, install the build-essential package.\n\nVerify your installation by opening a command line terminal and typing: \n`gcc --version` or `clang --version`.' },
  { id: 1003, module_id: 102, title: 'The Structure of a C File', order: 1, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'A C program starts with preprocessor directives. E.g., `#include <stdio.h>` allows us to use input/output functions. The entry point of every C application is the `int main()` function. Statements are nested in brackets and terminated by semicolons.' },
  { id: 1004, module_id: 102, title: 'Primitive Types & Variables', order: 2, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Learn about variable declaration syntax. C is statically typed. Primitive types include:\n- `char` (1 byte): Stores characters or small integers.\n- `int` (usually 4 bytes): Stores integers.\n- `float` (4 bytes): Stores single-precision floating numbers.\n- `double` (8 bytes): Stores double-precision floating numbers.' },
  { id: 1005, module_id: 103, title: 'If-Else Conditionals', order: 1, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Conditionally fork execution paths using boolean logic checks. Operators include `==`, `!=`, `<`, `>`, `<=`, `>=`. Use `&&` for logical AND, and `||` for logical OR.' },
  { id: 1006, module_id: 103, title: 'Switch-Case Statements', order: 2, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Switch blocks match integer or character cases for clean, multiple-branch logical selection. Make sure to use the `break` statement to prevent fallthrough.' },
  { id: 1007, module_id: 104, title: 'The For Loop in C', order: 1, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Iterate finite sequence blocks with clear initialization, boundary checks, and loop increments.\nExample:\n`for (int i = 0; i < 10; i++) { printf("%d\\n", i); }`' },
  { id: 1008, module_id: 104, title: 'While & Do-While Statements', order: 2, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Evaluate loops dynamically based on condition testing. While loops check the condition *before* execution, whereas do-while guarantees at least one execution iteration before evaluating.' },
  { id: 1009, module_id: 105, title: 'Declaring & Defining Functions', order: 1, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Understand return types, function declarations (prototypes), parameters, and pass-by-value mechanisms in C. Modularize your program by dividing tasks into specialized functions.' },
  
  // Advanced C Lessons
  { id: 2001, module_id: 201, title: 'Understanding Addresses & & Operator', order: 1, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Memory addresses are locations on the RAM. The address-of operator `&` returns this address. Learn how a pointer is declared using `type* name`.' },
  { id: 2002, module_id: 201, title: 'Dereferencing Pointers (*)', order: 2, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Deref pointers using `*` to read or edit values directly at the memory address. Pointer safety is crucial; always initialize pointers before dereferencing them.' },
  { id: 2003, module_id: 202, title: 'Heap Allocation (malloc & calloc)', order: 1, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Allocate dynamic buffer scopes on the heap using `malloc()` or `calloc()`. These buffers survive function stack execution but must be manually managed.' },
  { id: 2004, module_id: 202, title: 'Memory Freeing & Garbage Collection', order: 2, video_url: 'https://www.youtube.com/embed/KJgsSF0S90c', content: 'Always call `free()` to release dynamic memory. Neglecting this leads to memory leaks, which bloat system resource usage.' },

  // Python Lessons
  { id: 3001, module_id: 301, title: 'Python Setup & Hello World', order: 1, video_url: 'https://www.youtube.com/embed/kqtD5dpn9C8', content: 'Welcome to Python! Unlike C, Python is interpreted and has clean, simple syntax. Get started by writing:\n`print("Hello, World!")`' }
];

// Initialize localStorage DB
const initMockDB = () => {
  if (!localStorage.getItem('mock_db_initialized')) {
    localStorage.setItem('mock_courses', JSON.stringify(DEFAULT_COURSES));
    localStorage.setItem('mock_modules', JSON.stringify(DEFAULT_MODULES));
    localStorage.setItem('mock_lessons', JSON.stringify(DEFAULT_LESSONS));
    localStorage.setItem('mock_enrollments', JSON.stringify([]));
    localStorage.setItem('mock_progress', JSON.stringify([]));
    localStorage.setItem('mock_users', JSON.stringify([
      { id: 1, email: 'student@example.com', full_name: 'Student Demo', role: 'student', is_active: true },
      { id: 2, email: 'instructor@example.com', full_name: 'Instructor Demo', role: 'instructor', is_active: true },
      { id: 3, email: 'admin@example.com', full_name: 'Admin Demo', role: 'admin', is_active: true }
    ]));
    localStorage.setItem('mock_db_initialized', 'true');
  }
};

initMockDB();

// Helper to interact with DB
const getMockData = (key: string): any[] => JSON.parse(localStorage.getItem(key) || '[]');
const setMockData = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

// Create Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token (retained for mock mode)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// CUSTOM MOCK AXIOS ADAPTER
// -------------------------------------------------------------
api.defaults.adapter = async (config) => {
  initMockDB();
  
  let path = config.url || '';
  if (path.startsWith(config.baseURL || '')) {
    path = path.substring((config.baseURL || '').length);
  }
  path = path.split('?')[0]; // strip query string
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  const method = config.method?.toUpperCase();
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Helper response builders
  const successResponse = (data: any, status = 200) => {
    return {
      data,
      status,
      statusText: 'OK',
      headers: {},
      config,
    };
  };

  const errorResponse = (detail: string, status = 400) => {
    const error: any = new Error(detail);
    error.response = {
      data: { detail },
      status,
      statusText: 'Bad Request',
      headers: {},
      config,
    };
    throw error;
  };

  try {
    // 1. AUTHENTICATION
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      let user = users.find((u) => u.email === email);

      if (!user) {
        // Auto-create user for ease of testing
        const role = email.includes('instructor') ? 'instructor' : email.includes('admin') ? 'admin' : 'student';
        const name = email.split('@')[0];
        user = {
          id: users.length + 1,
          email,
          full_name: name.charAt(0).toUpperCase() + name.slice(1) + ' User',
          role,
          is_active: true,
        };
        users.push(user);
        setMockData('mock_users', users);
      }

      return successResponse({
        access_token: 'mock-jwt-token-' + user.id,
        token_type: 'bearer',
        user,
      });
    }

    if (path === '/auth/register' && method === 'POST') {
      const { email, password, full_name, role } = JSON.parse(config.data || '{}');
      const users = getMockData('mock_users');
      
      if (users.some((u) => u.email === email)) {
        return errorResponse('Email already registered', 400);
      }

      const newUser = {
        id: users.length + 1,
        email,
        full_name: full_name || 'New User',
        role: role || 'student',
        is_active: true,
      };

      users.push(newUser);
      setMockData('mock_users', users);
      return successResponse(newUser, 201);
    }

    if (path === '/auth/firebase-login' && method === 'POST') {
      const users = getMockData('mock_users');
      // Create or use student demo
      let user = users.find((u) => u.email === 'student@example.com');
      if (!user) {
        user = { id: 1, email: 'student@example.com', full_name: 'Student Demo', role: 'student', is_active: true };
        users.push(user);
        setMockData('mock_users', users);
      }
      return successResponse({
        access_token: 'mock-jwt-token-' + user.id,
        token_type: 'bearer',
        user,
      });
    }

    // 2. COURSES
    if (path === '/courses' && method === 'GET') {
      const courses = getMockData('mock_courses');
      if (currentUser?.role === 'admin') {
        return successResponse(courses);
      }
      return successResponse(courses.filter((c) => c.is_published));
    }

    if (path === '/courses/instructor/me' && method === 'GET') {
      const courses = getMockData('mock_courses');
      const instId = currentUser?.id || 2;
      return successResponse(courses.filter((c) => c.instructor_id === instId));
    }

    if (path.startsWith('/courses/') && method === 'GET') {
      const courseId = parseInt(path.split('/')[2], 10);
      const courses = getMockData('mock_courses');
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        return errorResponse('Course not found', 404);
      }
      return successResponse(course);
    }

    if (path === '/courses' && method === 'POST') {
      const data = JSON.parse(config.data || '{}');
      const courses = getMockData('mock_courses');
      
      const newCourse = {
        id: courses.length + 1,
        ...data,
        instructor_id: currentUser?.id || 2,
        is_published: false,
        created_at: new Date().toISOString(),
      };
      
      courses.push(newCourse);
      setMockData('mock_courses', courses);
      return successResponse(newCourse, 201);
    }

    if (path.startsWith('/courses/') && method === 'PUT') {
      const courseId = parseInt(path.split('/')[2], 10);
      const data = JSON.parse(config.data || '{}');
      const courses = getMockData('mock_courses');
      const index = courses.findIndex((c) => c.id === courseId);
      if (index === -1) {
        return errorResponse('Course not found', 404);
      }
      courses[index] = { ...courses[index], ...data };
      setMockData('mock_courses', courses);
      return successResponse(courses[index]);
    }

    if (path.startsWith('/courses/') && method === 'DELETE') {
      const courseId = parseInt(path.split('/')[2], 10);
      let courses = getMockData('mock_courses');
      if (!courses.some((c) => c.id === courseId)) {
        return errorResponse('Course not found', 404);
      }
      courses = courses.filter((c) => c.id !== courseId);
      setMockData('mock_courses', courses);
      return successResponse(null, 204);
    }

    if (path.startsWith('/courses/') && path.endsWith('/publish') && method === 'PATCH') {
      const courseId = parseInt(path.split('/')[2], 10);
      const courses = getMockData('mock_courses');
      const index = courses.findIndex((c) => c.id === courseId);
      if (index === -1) return errorResponse('Course not found', 404);
      courses[index].is_published = true;
      setMockData('mock_courses', courses);
      return successResponse(courses[index]);
    }

    if (path.startsWith('/courses/') && path.endsWith('/unpublish') && method === 'PATCH') {
      const courseId = parseInt(path.split('/')[2], 10);
      const courses = getMockData('mock_courses');
      const index = courses.findIndex((c) => c.id === courseId);
      if (index === -1) return errorResponse('Course not found', 404);
      courses[index].is_published = false;
      setMockData('mock_courses', courses);
      return successResponse(courses[index]);
    }

    // 3. CONTENT (MODULES & LESSONS)
    if (path.startsWith('/content/courses/') && path.endsWith('/modules') && method === 'GET') {
      const courseId = parseInt(path.split('/')[3], 10);
      const modules = getMockData('mock_modules');
      return successResponse(modules.filter((m) => m.course_id === courseId).sort((a, b) => a.order - b.order));
    }

    if (path === '/content/modules' && method === 'POST') {
      const data = JSON.parse(config.data || '{}');
      const modules = getMockData('mock_modules');
      const newModule = {
        id: Date.now() + Math.floor(Math.random() * 100),
        course_id: parseInt(data.course_id, 10),
        title: data.title,
        order: modules.length + 1,
      };
      modules.push(newModule);
      setMockData('mock_modules', modules);
      return successResponse(newModule, 201);
    }

    if (path.startsWith('/content/modules/') && path.endsWith('/lessons') && method === 'GET') {
      const moduleId = parseInt(path.split('/')[3], 10);
      const lessons = getMockData('mock_lessons');
      return successResponse(lessons.filter((l) => l.module_id === moduleId).sort((a, b) => a.order - b.order));
    }

    if (path === '/content/lessons' && method === 'POST') {
      const data = JSON.parse(config.data || '{}');
      const lessons = getMockData('mock_lessons');
      const newLesson = {
        id: Date.now() + Math.floor(Math.random() * 100),
        module_id: parseInt(data.module_id, 10),
        title: data.title,
        video_url: 'https://www.youtube.com/embed/KJgsSF0S90c',
        content: 'New lesson content. Start learning variables, memory addresses, or loops.',
        order: lessons.length + 1,
      };
      lessons.push(newLesson);
      setMockData('mock_lessons', lessons);
      return successResponse(newLesson, 201);
    }

    // 4. ENROLLMENTS
    if (path === '/enrollments/me' && method === 'GET') {
      const enrollments = getMockData('mock_enrollments');
      const userEnrollments = enrollments.filter((e) => e.student_id === (currentUser?.id || 1));
      return successResponse(userEnrollments);
    }

    if (path.startsWith('/enrollments/') && method === 'POST') {
      const courseId = parseInt(path.split('/')[2], 10);
      const enrollments = getMockData('mock_enrollments');
      const studentId = currentUser?.id || 1;
      
      if (enrollments.some((e) => e.course_id === courseId && e.student_id === studentId)) {
        return errorResponse('Already enrolled in this course', 400);
      }

      const newEnrollment = {
        id: enrollments.length + 1,
        course_id: courseId,
        student_id: studentId,
        enrolled_at: new Date().toISOString(),
      };
      enrollments.push(newEnrollment);
      setMockData('mock_enrollments', enrollments);
      return successResponse(newEnrollment, 201);
    }

    if (path.startsWith('/enrollments/') && method === 'DELETE') {
      const courseId = parseInt(path.split('/')[2], 10);
      let enrollments = getMockData('mock_enrollments');
      const studentId = currentUser?.id || 1;

      enrollments = enrollments.filter((e) => !(e.course_id === courseId && e.student_id === studentId));
      setMockData('mock_enrollments', enrollments);
      return successResponse({ message: 'Unenrolled successfully' });
    }

    // 5. PROGRESS & ASSESSMENT
    if (path.startsWith('/assessment/progress/') && method === 'GET') {
      const courseId = parseInt(path.split('/')[3], 10);
      const progress = getMockData('mock_progress');
      const lessons = getMockData('mock_lessons');
      const modules = getMockData('mock_modules');
      
      const courseModuleIds = modules.filter((m) => m.course_id === courseId).map((m) => m.id);
      const courseLessonIds = lessons.filter((l) => courseModuleIds.includes(l.module_id)).map((l) => l.id);
      
      const userProgress = progress.filter(
        (p) => p.user_id === (currentUser?.id || 1) && courseLessonIds.includes(p.lesson_id)
      );
      
      return successResponse(userProgress);
    }

    if (path === '/assessment/progress' && method === 'POST') {
      const { lesson_id, completed } = JSON.parse(config.data || '{}');
      const progress = getMockData('mock_progress');
      const userId = currentUser?.id || 1;

      let record = progress.find((p) => p.user_id === userId && p.lesson_id === lesson_id);
      if (record) {
        record.completed = completed;
        record.completed_at = completed ? new Date().toISOString() : null;
      } else {
        record = {
          id: progress.length + 1,
          user_id: userId,
          lesson_id,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        };
        progress.push(record);
      }

      setMockData('mock_progress', progress);
      return successResponse(record);
    }

    // Default Fallback
    return errorResponse(`Mock API route not found for path: ${path} [${method}]`, 404);
  } catch (error: any) {
    if (error.response) {
      throw error;
    }
    return errorResponse(error.message || 'Server error', 500);
  }
};

export default api;
