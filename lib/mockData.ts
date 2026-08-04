import { Course, MaterialRequest, MockUser, Resource } from '@/types/resource';

const COURSE_DEFS: Omit<Course, 'resourceCount'>[] = [
  { code: 'CSM 151', title: 'Structured Programming', level: 100, semester: 1, lecturer: 'Dr. K. Owusu' },
  { code: 'CSM 152', title: 'Discrete Mathematics', level: 100, semester: 1, lecturer: 'Prof. A. Mensah' },
  { code: 'CSM 155', title: 'Computer Systems Fundamentals', level: 100, semester: 2, lecturer: 'Dr. E. Boateng' },
  { code: 'CSM 158', title: 'Introduction to Web Technologies', level: 100, semester: 2, lecturer: 'Dr. K. Owusu' },

  { code: 'CSM 251', title: 'Data Structures', level: 200, semester: 1, lecturer: 'Prof. A. Mensah' },
  { code: 'CSM 253', title: 'Object-Oriented Programming', level: 200, semester: 1, lecturer: 'Dr. N. Asante' },
  { code: 'CSM 257', title: 'Computer Architecture', level: 200, semester: 2, lecturer: 'Dr. E. Boateng' },
  { code: 'CSM 259', title: 'Database Systems I', level: 200, semester: 2, lecturer: 'Dr. N. Asante' },

  { code: 'CSM 351', title: 'Algorithms', level: 300, semester: 1, lecturer: 'Prof. A. Mensah' },
  { code: 'CSM 353', title: 'Operating Systems', level: 300, semester: 1, lecturer: 'Dr. K. Owusu' },
  { code: 'CSM 357', title: 'Software Engineering', level: 300, semester: 2, lecturer: 'Dr. E. Boateng' },
  { code: 'CSM 359', title: 'Computer Networks', level: 300, semester: 2, lecturer: 'Dr. N. Asante' },

  { code: 'CSM 451', title: 'Artificial Intelligence', level: 400, semester: 1, lecturer: 'Prof. A. Mensah' },
  { code: 'CSM 453', title: 'Distributed Systems', level: 400, semester: 1, lecturer: 'Dr. K. Owusu' },
  { code: 'CSM 457', title: 'Final Year Project', level: 400, semester: 2, lecturer: 'Dept. Coordinator' },
  { code: 'CSM 459', title: 'Cybersecurity', level: 400, semester: 2, lecturer: 'Dr. N. Asante' },
];

function course(code: string) {
  const c = COURSE_DEFS.find((c) => c.code === code)!;
  return { code: c.code, title: c.title, level: c.level, semester: c.semester };
}

let nextId = 1;
function resource(input: Omit<Resource, 'id' | 'courseTitle' | 'level' | 'semester' | 'status' | 'downloadCount' | 'uploadedBy' | 'createdAt'>): Resource {
  const c = course(input.courseCode);
  return {
    id: String(nextId++),
    courseTitle: c.title,
    level: c.level,
    semester: c.semester,
    status: 'ACTIVE',
    downloadCount: 0,
    uploadedBy: 'Course Rep',
    createdAt: '2025',
    ...input,
  };
}

export const MOCK_RESOURCES: Resource[] = [
  resource({ title: 'Lecture Slides – Introduction to C', courseCode: 'CSM 151', type: 'SLIDES', academicYear: '2024/2025', fileSize: '3.1 MB' }),
  resource({ title: 'Lecture Slides – Control Structures', courseCode: 'CSM 151', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.4 MB' }),
  resource({ title: 'Past Questions 2023', courseCode: 'CSM 151', type: 'PAST_QUESTION', academicYear: '2023/2024', fileSize: '900 KB' }),
  resource({ title: 'Lab Manual – Weeks 1–4', courseCode: 'CSM 151', type: 'LAB_MANUAL', academicYear: '2024/2025', fileSize: '1.2 MB' }),
  resource({ title: 'Recommended Textbook (C Programming)', courseCode: 'CSM 151', type: 'BOOK', academicYear: '2022/2023', externalUrl: 'https://drive.google.com/example' }),

  resource({ title: 'Lecture Notes', courseCode: 'CSM 152', type: 'NOTES', academicYear: '2024/2025', fileSize: '1.8 MB' }),
  resource({ title: 'Past Questions', courseCode: 'CSM 152', type: 'PAST_QUESTION', academicYear: '2023/2024', fileSize: '750 KB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 155', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.0 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 158', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.6 MB' }),
  resource({ title: 'Lab Manual', courseCode: 'CSM 158', type: 'LAB_MANUAL', academicYear: '2024/2025', fileSize: '1.1 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 251', type: 'SLIDES', academicYear: '2024/2025', fileSize: '3.4 MB' }),
  resource({ title: 'Past Questions', courseCode: 'CSM 251', type: 'PAST_QUESTION', academicYear: '2023/2024', fileSize: '1.0 MB' }),
  resource({ title: 'Lab Manual', courseCode: 'CSM 251', type: 'LAB_MANUAL', academicYear: '2024/2025', fileSize: '900 KB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 253', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.9 MB' }),
  resource({ title: 'Lecture Notes', courseCode: 'CSM 253', type: 'NOTES', academicYear: '2023/2024', fileSize: '1.4 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 257', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.1 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 259', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.7 MB' }),
  resource({ title: 'Past Questions', courseCode: 'CSM 259', type: 'PAST_QUESTION', academicYear: '2023/2024', fileSize: '1.1 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 351', type: 'SLIDES', academicYear: '2024/2025', fileSize: '3.6 MB' }),
  resource({ title: 'Past Questions', courseCode: 'CSM 351', type: 'PAST_QUESTION', academicYear: '2023/2024', fileSize: '1.3 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 353', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.5 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 357', type: 'SLIDES', academicYear: '2024/2025', fileSize: '3.0 MB' }),
  resource({ title: 'Lecture Notes', courseCode: 'CSM 357', type: 'NOTES', academicYear: '2023/2024', fileSize: '1.6 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 359', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.2 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 451', type: 'SLIDES', academicYear: '2024/2025', fileSize: '3.3 MB' }),
  resource({ title: 'Past Questions', courseCode: 'CSM 451', type: 'PAST_QUESTION', academicYear: '2023/2024', fileSize: '1.0 MB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 453', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.8 MB' }),

  resource({ title: 'Project Guidelines', courseCode: 'CSM 457', type: 'OTHER', academicYear: '2024/2025', fileSize: '500 KB' }),

  resource({ title: 'Lecture Slides', courseCode: 'CSM 459', type: 'SLIDES', academicYear: '2024/2025', fileSize: '2.6 MB' }),
  resource({ title: 'Lab Manual', courseCode: 'CSM 459', type: 'LAB_MANUAL', academicYear: '2024/2025', fileSize: '1.0 MB' }),
];

export const MOCK_COURSES: Course[] = COURSE_DEFS.map((c) => ({
  ...c,
  resourceCount: MOCK_RESOURCES.filter((r) => r.courseCode === c.code).length,
}));

// Sample directory the mock sign-in flow looks an email up against.
// TODO(backend): replace with a real Prisma User lookup keyed by verified email.
export const MOCK_USERS: MockUser[] = [
  { email: 'ama.serwaa@st.knust.edu.gh', name: 'Ama Serwaa', role: 'STUDENT', level: 200, indexNumber: '8412621', status: 'ACTIVE' },
  { email: 'kofi.mensah@st.knust.edu.gh', name: 'Kofi Mensah', role: 'STUDENT', level: 100, indexNumber: '8501122', status: 'ACTIVE' },
  { email: 'efua.owusu@st.knust.edu.gh', name: 'Efua Owusu', role: 'REP', level: 300, indexNumber: '8300456', status: 'ACTIVE' },
  { email: 'yaw.darko@st.knust.edu.gh', name: 'Yaw Darko', role: 'REP', level: 100, indexNumber: '8100987', status: 'ACTIVE' },
  { email: 'kwabena.asante@st.knust.edu.gh', name: 'Kwabena Asante', role: 'SUPER_ADMIN', level: 400, indexNumber: '8000001', status: 'ACTIVE' },
];

// TODO(backend): replace with GET /api/requests + PATCH /api/requests/:id (super-admin only, see Appendix B).
export const MOCK_REQUESTS: MaterialRequest[] = [
  { id: 'req-1', courseCode: 'CSM 253', note: 'Looking for 2022/2023 past questions.', status: 'OPEN' },
  { id: 'req-2', courseCode: 'CSM 357', note: 'Missing lecture notes for weeks 5-8.', status: 'OPEN' },
  { id: 'req-3', courseCode: 'CSM 158', note: 'Any recording of the HTML/CSS lab walkthrough?', status: 'FULFILLED' },
  { id: 'req-4', note: 'Can we get a general study-skills resource for 100 level?', status: 'DISMISSED' },
];
