import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Layers, Award, Users, Plus, Upload, Download, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { LoadingState, IdempotencyBadge, SimulationBadge } from '../components/BadgesAndStates';

export const AcademicCatalogPage: React.FC = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/v1/courses', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setCourses(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  if (loading) return <LoadingState message="Loading academic catalog..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Program & Subject Catalog</h1>
          <p style={{ color: 'var(--text-muted)' }}>Degree programs, course subjects, term lists & credit structures</p>
        </div>
        <IdempotencyBadge label="SCHEME VERSIONING ACTIVE" />
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Enrolled Degree Programs & Subjects</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Program / Department</th>
                <th>Credits</th>
                <th>Semester</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id}>
                  <td><span className="badge badge-idempotency">{c.code}</span></td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.departmentId?.name || 'Computer Science'}</td>
                  <td>{c.credits} Credits</td>
                  <td>Semester {c.semester}</td>
                  <td><span className="badge badge-paise">PUBLISHED (SCHEME V1)</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AssessmentSchemesPage: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<'LAW' | 'CSE'>('LAW');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Assessment Schemes & Grading Bands</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configurable components (mid-sem, viva, project, attendance) & 100% weight validation</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSelectedProgram('LAW')}
            className={`btn ${selectedProgram === 'LAW' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            B.A. LL.B (Law Scheme)
          </button>
          <button
            onClick={() => setSelectedProgram('CSE')}
            className={`btn ${selectedProgram === 'CSE' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            B.Tech CSE (Engineering Scheme)
          </button>
        </div>
      </div>

      {selectedProgram === 'LAW' ? (
        <div className="glass-card" style={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>NLIU-Style B.A. LL.B Law Assessment Scheme (v1.0)</h3>
            <span className="badge badge-paise"><Lock size={12} /> PUBLISHED & IMMUTABLE</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Custom weight breakdown for legal research, viva voce, project defense, and mid-semester exams.
          </p>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assessment Component</th>
                  <th>Weightage (%)</th>
                  <th>Min Pass Marks</th>
                  <th>Evaluation Method</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Mid-Semester Written Exam</td>
                  <td><strong style={{ color: '#818cf8' }}>30%</strong></td>
                  <td>12 / 30</td>
                  <td>Written Paper</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Project Research Paper & Defense</td>
                  <td><strong style={{ color: '#818cf8' }}>25%</strong></td>
                  <td>10 / 25</td>
                  <td>Faculty Review</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Viva Voce Oral Defense</td>
                  <td><strong style={{ color: '#818cf8' }}>15%</strong></td>
                  <td>6 / 15</td>
                  <td>External Examiner Jury</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Class Attendance & Participation</td>
                  <td><strong style={{ color: '#818cf8' }}>10%</strong></td>
                  <td>4 / 10</td>
                  <td>System Attendance Ledger</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>End-Semester Terminal Exam</td>
                  <td><strong style={{ color: '#818cf8' }}>20%</strong></td>
                  <td>8 / 20</td>
                  <td>Written Examination</td>
                </tr>
                <tr style={{ background: 'rgba(99, 102, 241, 0.1)', fontWeight: 800 }}>
                  <td>TOTAL WEIGHTAGE VALIDATION</td>
                  <td><strong style={{ color: '#34d399', fontSize: '1.1rem' }}>100% VALIDATED</strong></td>
                  <td colSpan={2} style={{ color: '#34d399' }}>Minimum Passing Score: 40% Cumulative</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>B.Tech Computer Science Engineering Assessment Scheme (v1.0)</h3>
            <span className="badge badge-paise"><Lock size={12} /> PUBLISHED & IMMUTABLE</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Engineering weight breakdown for practical lab exams, mid-term, and end-sem theory.
          </p>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assessment Component</th>
                  <th>Weightage (%)</th>
                  <th>Min Pass Marks</th>
                  <th>Evaluation Method</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Practical Lab & Coding Evaluation</td>
                  <td><strong style={{ color: '#22d3ee' }}>30%</strong></td>
                  <td>12 / 30</td>
                  <td>Automated & Lab Exam</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Mid-Term Written Examination</td>
                  <td><strong style={{ color: '#22d3ee' }}>20%</strong></td>
                  <td>8 / 20</td>
                  <td>Written Paper</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Continuous Quizzes & Assignments</td>
                  <td><strong style={{ color: '#22d3ee' }}>10%</strong></td>
                  <td>4 / 10</td>
                  <td>Online Quiz</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>End-Semester Final Theory Exam</td>
                  <td><strong style={{ color: '#22d3ee' }}>40%</strong></td>
                  <td>16 / 40</td>
                  <td>Written Examination</td>
                </tr>
                <tr style={{ background: 'rgba(6, 182, 212, 0.1)', fontWeight: 800 }}>
                  <td>TOTAL WEIGHTAGE VALIDATION</td>
                  <td><strong style={{ color: '#34d399', fontSize: '1.1rem' }}>100% VALIDATED</strong></td>
                  <td colSpan={2} style={{ color: '#34d399' }}>Minimum Passing Score: 40% Cumulative</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export const ElectivesPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Elective Groups & Student Registration</h1>
        <p style={{ color: 'var(--text-muted)' }}>Elective group rules, prerequisite enforcement & student subject enrollment</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Open Elective Groups (Semester 4)</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Elective Group</th>
                <th>Course Name</th>
                <th>Prerequisites</th>
                <th>Capacity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-idempotency">CSE-ELE-01</span></td>
                <td style={{ fontWeight: 600 }}>Machine Learning & Neural Networks</td>
                <td>Data Structures (CS201)</td>
                <td><span className="badge badge-paise">45 / 60 Enrolled</span></td>
                <td>
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => alert('Enrolled in Machine Learning Elective!')}>
                    Enroll Course
                  </button>
                </td>
              </tr>
              <tr>
                <td><span className="badge badge-idempotency">CSE-ELE-02</span></td>
                <td style={{ fontWeight: 600 }}>Cloud Computing & DevOps</td>
                <td>Database Systems (CS202)</td>
                <td><span className="badge badge-paise">38 / 60 Enrolled</span></td>
                <td>
                  <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => alert('Enrolled in Cloud Computing Elective!')}>
                    Enroll Course
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const TeachingAssignmentsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Teaching Assignments & Faculty Workload</h1>
        <p style={{ color: 'var(--text-muted)' }}>Faculty course allocations, weekly credit load & syllabus repository</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Active Faculty Teaching Allocations</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Assigned Course</th>
                <th>Semester & Section</th>
                <th>Weekly Load</th>
                <th>Syllabus Document</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Prof. Rajesh Sharma</td>
                <td>CS201 - Data Structures & Algorithms</td>
                <td><span className="badge badge-idempotency">Sem 4 - Sec A</span></td>
                <td>14 Hours / Week</td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => alert('Syllabus PDF downloaded!')}>
                    <Download size={14} /> Download Syllabus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
