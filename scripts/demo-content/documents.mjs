// Text of the demo PDFs. Written for demonstration only: these are NOT
// official UCC examination papers or lecture notes.

export const PAPERS = [
  {
    file: 'mat105-2024-s1.pdf',
    course: 'MAT 105: Engineering Mathematics I',
    exam: 'End of First Semester Examination, 2024',
    instructions: 'Answer ALL questions in Section A and any TWO in Section B. Time allowed: 2 hours.',
    sections: [
      {
        title: 'Section A (40 marks)',
        questions: [
          'Express z = (3 + 4i) / (1 - 2i) in the form a + bi, and find |z| and arg(z).',
          'Use De Moivre\'s theorem to find all cube roots of -8, giving answers in the form a + bi.',
          'Evaluate lim (x -> 0) of (sin 3x) / x and lim (x -> infinity) of (2x^2 + 1) / (5x^2 - x).',
          'Given A = [[2, 1], [3, 4]], find A^-1 and verify that A A^-1 = I.',
        ],
      },
      {
        title: 'Section B (60 marks)',
        questions: [
          'Solve the system x + 2y - z = 4, 2x - y + 3z = 9, 3x + y + 2z = 13 using Cramer\'s rule.',
          'Differentiate y = x^3 e^(2x) ln x, and find the equation of the tangent to y = x^2 - 4x + 3 at x = 1.',
          'Find the partial fractions of (5x + 1) / ((x + 1)(x - 2)) and hence evaluate the integral from 3 to 4.',
        ],
      },
    ],
  },
  {
    file: 'mat105-2023-s1.pdf',
    course: 'MAT 105: Engineering Mathematics I',
    exam: 'End of First Semester Examination, 2023',
    instructions: 'Answer ANY FOUR questions. All questions carry equal marks. Time allowed: 2 hours.',
    sections: [
      {
        title: 'Questions',
        questions: [
          'If z1 = 2 - 3i and z2 = -1 + i, find z1 z2, z1 / z2 and the conjugate of (z1 + z2).',
          'Show that the matrix [[1, 2, 3], [0, 1, 4], [5, 6, 0]] is invertible and find its inverse.',
          'Find dy/dx when x^2 + xy + y^3 = 7. Hence find the gradient of the curve at (1, 1.5).',
          'Determine the first four non-zero terms of the Maclaurin series of e^x cos x.',
          'Evaluate the integral of x sin x dx, and the integral of 1 / (x^2 + 4x + 13) dx.',
          'A beam of length 6 m carries a load such that its deflection is y = x^2 (6 - x) / 50. Find the maximum deflection.',
        ],
      },
    ],
  },
  {
    file: 'mat105-2024-mid.pdf',
    course: 'MAT 105: Engineering Mathematics I',
    exam: 'Mid-Semester Quiz, 2024',
    instructions: 'Answer ALL questions. Time allowed: 45 minutes.',
    sections: [
      {
        title: 'Questions (20 marks)',
        questions: [
          'Write -1 + i in polar form.',
          'Find the determinant of [[4, -2], [3, 5]].',
          'Evaluate lim (x -> 2) of (x^2 - 4) / (x - 2).',
          'Find the 10th term and the sum of the first 10 terms of 3, 7, 11, ...',
        ],
      },
    ],
  },
  {
    file: 'gen103-2024-s1.pdf',
    course: 'GEN 103: Basic Mechanics',
    exam: 'End of First Semester Examination, 2024',
    instructions: 'Answer ANY THREE questions. Take g = 9.81 m/s^2. Time allowed: 2 hours.',
    sections: [
      {
        title: 'Questions',
        questions: [
          'Three coplanar forces of 20 N, 35 N and 40 N act at a point at 0, 120 and 225 degrees to the x-axis. Find the magnitude and direction of their resultant.',
          'A 4 m uniform ladder of mass 15 kg rests against a smooth wall at 60 degrees to the floor. Find the minimum coefficient of friction at the floor for equilibrium.',
          'A car accelerates uniformly from rest to 25 m/s in 10 s, then brakes uniformly to rest in 50 m. Find the total time and distance.',
          'A projectile is fired at 40 m/s at 30 degrees above the horizontal. Find its maximum height, time of flight and range.',
          'Locate the centroid of a T-section with a 120 mm x 20 mm flange and a 100 mm x 20 mm web.',
        ],
      },
    ],
  },
  {
    file: 'cms107-2024-s1.pdf',
    course: 'CMS 107: Communicative Skills',
    exam: 'End of First Semester Examination, 2024',
    instructions: 'Answer Question 1 and any TWO others. Time allowed: 2 hours.',
    sections: [
      {
        title: 'Questions',
        questions: [
          'Read the passage provided and (a) summarise it in not more than 100 words; (b) identify the writer\'s main argument and two supporting points.',
          'Explain FOUR differences between active and passive reading, with an example of each.',
          'Write an essay of about 400 words on "Social media has done more harm than good to student life". Use a clear introduction, body paragraphs and conclusion.',
          'With examples, explain the difference between a topic sentence and a controlling idea.',
          'Identify and correct the errors: (a) "Each of the students have submitted their work." (b) "The lecturer, along with his assistants, were late."',
        ],
      },
    ],
  },
  {
    file: 'acc101-2024-s1.pdf',
    course: 'ACC 101: Introduction to Financial Reporting I',
    exam: 'End of First Semester Examination, 2024',
    instructions: 'Answer ALL questions. Show all workings. Time allowed: 2 hours 30 minutes.',
    sections: [
      {
        title: 'Questions',
        questions: [
          'Explain the accounting equation and show how each of these affects it: (a) owner invests GHS 20,000 cash; (b) goods worth GHS 5,000 bought on credit; (c) rent of GHS 1,200 paid.',
          'Ama Traders had these balances on 31 December 2023: Sales GHS 84,000; Purchases GHS 52,000; Opening inventory GHS 6,500; Closing inventory GHS 8,200; Wages GHS 9,400; Rent GHS 4,800. Prepare a statement of profit or loss.',
          'Distinguish between capital and revenue expenditure, giving two examples of each.',
          'A machine costing GHS 45,000 has a residual value of GHS 5,000 and a useful life of 5 years. Compute the yearly depreciation using the straight-line and 30% reducing balance methods.',
        ],
      },
    ],
  },
  {
    file: 'nur101-2023-s1.pdf',
    course: 'NUR 101: Human Anatomy I',
    exam: 'End of First Semester Examination, 2023',
    instructions: 'Section A: answer ALL. Section B: answer any TWO. Time allowed: 2 hours.',
    sections: [
      {
        title: 'Section A: short answers',
        questions: [
          'Define the anatomical position.',
          'Name the four types of tissue in the human body.',
          'List the bones of the shoulder girdle.',
          'Differentiate between the axial and the appendicular skeleton.',
        ],
      },
      {
        title: 'Section B: essays',
        questions: [
          'Describe the structure of a typical synovial joint and name three examples.',
          'Describe the layers of the skin and the function of each.',
          'Describe the anatomical planes and directional terms, giving a clinical example for each.',
        ],
      },
    ],
  },
]

export const NOTES = [
  {
    file: 'mat105-complex-numbers-notes.pdf',
    title: 'Complex numbers: a revision guide',
    course: 'MAT 105: Engineering Mathematics I',
    pages: [
      {
        heading: '1. The basics',
        lines: [
          'A complex number has the form z = a + bi, where i^2 = -1.',
          'Re(z) = a is the real part and Im(z) = b is the imaginary part.',
          'The conjugate of z is a - bi; z times its conjugate = a^2 + b^2.',
          'To divide, multiply top and bottom by the conjugate of the denominator.',
          '',
          'Worked example: (2 + 3i) / (1 - i)',
          '= (2 + 3i)(1 + i) / ((1 - i)(1 + i))',
          '= (2 + 2i + 3i - 3) / 2 = (-1 + 5i) / 2',
        ],
      },
      {
        heading: '2. Polar form',
        lines: [
          'z = r(cos t + i sin t), where r = |z| = sqrt(a^2 + b^2) and t = arg(z).',
          'Watch the quadrant when finding arg(z) from tan t = b / a.',
          'Multiplying: multiply the moduli and add the arguments.',
          'Dividing: divide the moduli and subtract the arguments.',
        ],
      },
      {
        heading: '3. De Moivre\'s theorem',
        lines: [
          '(cos t + i sin t)^n = cos nt + i sin nt.',
          'The n-th roots of z are spaced 360/n degrees apart on a circle of radius r^(1/n).',
          '',
          'Exam tip: past papers almost always ask for roots of a complex number.',
          'Practise cube roots of -8 and fourth roots of 16i.',
        ],
      },
    ],
  },
  {
    file: 'gen105-circuit-laws-notes.pdf',
    title: 'Circuit laws summary',
    course: 'GEN 105: Applied Electricity',
    pages: [
      {
        heading: 'Ohm\'s law and power',
        lines: [
          'V = I R. Power P = V I = I^2 R = V^2 / R.',
          'Series resistors: R = R1 + R2 + ... (same current through each).',
          'Parallel resistors: 1/R = 1/R1 + 1/R2 + ... (same voltage across each).',
        ],
      },
      {
        heading: 'Kirchhoff\'s laws',
        lines: [
          'KCL: the currents entering a node sum to zero.',
          'KVL: the voltages around any closed loop sum to zero.',
          'Choose loop directions first and keep the sign convention consistent.',
          '',
          'Worked example: a 12 V source drives 4 ohms in series with (6 || 3) ohms.',
          '6 || 3 = 2 ohms, total R = 6 ohms, I = 2 A, voltage across 4 ohms = 8 V.',
        ],
      },
    ],
  },
  {
    file: 'acc101-double-entry-notes.pdf',
    title: 'Double entry in one page',
    course: 'ACC 101: Introduction to Financial Reporting I',
    pages: [
      {
        heading: 'The rule',
        lines: [
          'Every transaction has two equal and opposite effects.',
          'Debit: increases in assets and expenses; decreases in liabilities, capital and income.',
          'Credit: increases in liabilities, capital and income; decreases in assets and expenses.',
          '',
          'Example: bought goods on credit for GHS 2,000.',
          'Dr Purchases 2,000    Cr Payables 2,000',
          '',
          'The trial balance totals agree only if every debit has a matching credit.',
        ],
      },
    ],
  },
]
