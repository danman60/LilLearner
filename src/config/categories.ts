import { CategoryConfig } from '../types';

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'literacy',
    name: 'Literacy',
    icon: '📚',
    color: '#fcefc2',
    skills: [
      { id: 'letter_names', name: 'Letter Names', description: 'Recognizes and names all uppercase and lowercase letters', tracking_type: 'mastery', milestones: ['uppercase', 'lowercase'] },
      { id: 'letter_sounds', name: 'Letter Sounds', description: 'Associates letters with their phonetic sounds', tracking_type: 'mastery', milestones: ['consonants', 'vowels', 'blends'] },
      { id: 'reading_lessons', name: 'Reading Program Progress', description: 'Progress through structured reading curriculum', tracking_type: 'numeric', unit: 'lessons', target: 100 },
      { id: 'cvc_words', name: 'CVC Word Recognition', description: 'Reads consonant-vowel-consonant words', tracking_type: 'mastery', milestones: ['simple_cvc', 'complex_cvc', 'beyond_cvc'] },
      { id: 'printing', name: 'Printing & Writing', description: 'Writes letters and simple words', tracking_type: 'progress', milestones: ['tracing', 'uppercase_independent', 'lowercase_independent', 'name_writing', 'simple_words'] },
      { id: 'books_read', name: 'Books Read', description: 'Chapter books or read-alouds completed', tracking_type: 'count', unit: 'books' },
      { id: 'narration', name: 'Narration & Comprehension', description: 'Retells stories, answers questions, discusses vocabulary', tracking_type: 'progress', milestones: ['answers_questions', 'retells_events', 'discusses_vocabulary', 'makes_predictions'] },
    ],
  },
  {
    id: 'numeracy',
    name: 'Numeracy',
    icon: '🔢',
    color: '#d4e8f7',
    skills: [
      { id: 'counting', name: 'Counting', description: 'Counts objects and recites numbers in sequence', tracking_type: 'numeric', unit: 'highest_number', milestones: [10, 20, 30, 40, 50, 100] },
      { id: 'numeral_recognition', name: 'Numeral Recognition', description: 'Identifies written numerals', tracking_type: 'progress', milestones: ['1-10', '11-20', '21-30', '31-50'] },
      { id: 'math_lessons', name: 'Math Program Progress', description: 'Progress through math curriculum', tracking_type: 'numeric', unit: 'lessons' },
      { id: 'addition', name: 'Early Addition', description: 'Understands combining quantities', tracking_type: 'progress', milestones: ['concept_understanding', 'fingers_manipulatives', 'mental_to_5', 'mental_to_10'] },
      { id: 'practical_math', name: 'Practical Math Skills', description: 'Real-world number applications', tracking_type: 'checklist', items: ['phone_number', 'address', 'birthday', 'age'] },
    ],
  },
  {
    id: 'fine_motor',
    name: 'Fine Motor',
    icon: '✋',
    color: '#f7dce8',
    skills: [
      { id: 'pencil_grip', name: 'Pencil Grip', description: 'Proper tripod grip development', tracking_type: 'progress', milestones: ['fist_grip', 'four_finger', 'tripod_developing', 'tripod_mature'] },
      { id: 'tracing', name: 'Tracing', description: 'Traces lines, shapes, and letters', tracking_type: 'mastery', milestones: ['straight_lines', 'curves', 'shapes', 'letters'] },
      { id: 'cutting', name: 'Scissor Skills', description: 'Cuts with scissors along lines', tracking_type: 'progress', milestones: ['snipping', 'straight_lines', 'curves', 'shapes'] },
      { id: 'coloring', name: 'Coloring', description: 'Colors within boundaries with control', tracking_type: 'progress', milestones: ['scribbling', 'general_area', 'mostly_in_lines', 'precise'] },
      { id: 'manipulatives', name: 'Manipulatives & Crafts', description: 'Works with small objects, beads, playdough, puzzles', tracking_type: 'activity_log' },
    ],
  },
  {
    id: 'gross_motor',
    name: 'Gross Motor',
    icon: '🤸',
    color: '#d8f0d4',
    skills: [
      { id: 'outdoor_time', name: 'Outdoor Time', description: 'Hours spent in outdoor play and nature', tracking_type: 'cumulative', unit: 'hours' },
      { id: 'balance', name: 'Balance & Coordination', description: 'Balance beam, one-foot standing, etc.', tracking_type: 'checklist', items: ['one_foot_5sec', 'balance_beam', 'hopping', 'skipping'] },
      { id: 'gymnastics', name: 'Gymnastics Skills', description: 'Tumbling and gymnastics movements', tracking_type: 'checklist', items: ['forward_roll', 'back_bridge', 'cartwheel', 'handstand'] },
      { id: 'swimming', name: 'Swimming', description: 'Water comfort and swimming skills', tracking_type: 'progress', milestones: ['water_comfort', 'floating', 'kicking', 'basic_strokes', 'independent_swimming'] },
      { id: 'ball_skills', name: 'Ball Skills', description: 'Throwing, catching, kicking', tracking_type: 'checklist', items: ['underhand_throw', 'overhand_throw', 'catch_large_ball', 'catch_small_ball', 'kick'] },
      { id: 'structured_activities', name: 'Structured Activities', description: 'Dance, gymnastics, sports classes', tracking_type: 'activity_log' },
    ],
  },
  {
    id: 'social_emotional',
    name: 'Social & Emotional',
    icon: '💜',
    color: '#e8daf7',
    skills: [
      { id: 'empathy', name: 'Empathy & Awareness', description: "Recognizes and responds to others' feelings", tracking_type: 'observation_log' },
      { id: 'self_regulation', name: 'Self-Regulation', description: 'Manages emotions and impulses', tracking_type: 'progress', milestones: ['recognizes_emotions', 'uses_words', 'self_calming', 'problem_solving'] },
      { id: 'self_compassion', name: 'Self-Compassion', description: 'Kind self-talk, handles mistakes gracefully', tracking_type: 'observation_log' },
      { id: 'social_play', name: 'Social Play', description: 'Plays cooperatively with peers and siblings', tracking_type: 'progress', milestones: ['parallel_play', 'interactive_play', 'turn_taking', 'cooperative_games', 'conflict_resolution'] },
      { id: 'sibling_interaction', name: 'Sibling Interaction', description: 'Gentle and appropriate play with siblings', tracking_type: 'observation_log' },
    ],
  },
  {
    id: 'practical_life',
    name: 'Practical Life',
    icon: '🏠',
    color: '#fcefc2',
    skills: [
      { id: 'dressing', name: 'Dressing', description: 'Independently puts on and removes clothing', tracking_type: 'checklist', items: ['shirt', 'pants', 'socks', 'shoes', 'coat', 'buttons', 'zippers'] },
      { id: 'hygiene', name: 'Personal Hygiene', description: 'Handwashing, teeth brushing, toileting', tracking_type: 'checklist', items: ['handwashing', 'teeth_brushing', 'toileting_independent', 'bathing_assistance'] },
      { id: 'chores', name: 'Household Chores', description: 'Contributes to household tasks', tracking_type: 'checklist', items: ['bed_making', 'table_setting', 'cutlery_sorting', 'toy_cleanup', 'laundry_help', 'pet_care'] },
      { id: 'meal_skills', name: 'Meal Skills', description: 'Eating independently and helping with food prep', tracking_type: 'checklist', items: ['utensil_use', 'pouring', 'spreading', 'simple_prep', 'cleanup'] },
    ],
  },
  {
    id: 'creative_expression',
    name: 'Creative Expression',
    icon: '🎨',
    color: '#f7dce8',
    skills: [
      { id: 'music', name: 'Music & Singing', description: 'Singing, rhythm, musical activities', tracking_type: 'activity_log' },
      { id: 'art', name: 'Visual Art', description: 'Drawing, painting, crafts', tracking_type: 'activity_log', sub_activities: ['drawing', 'painting', 'watercolors', 'collage', 'playdough', 'crafts'] },
      { id: 'imaginative_play', name: 'Imaginative Play', description: 'Pretend play, role-playing, storytelling', tracking_type: 'observation_log' },
      { id: 'dance_movement', name: 'Dance & Movement', description: 'Creative movement and dance', tracking_type: 'activity_log' },
    ],
  },
  {
    id: 'nature_science',
    name: 'Nature & Science',
    icon: '🌿',
    color: '#d8f0d4',
    skills: [
      { id: 'outdoor_exploration', name: 'Outdoor Exploration', description: 'Time in nature - forests, parks, beaches', tracking_type: 'cumulative', unit: 'hours' },
      { id: 'nature_knowledge', name: 'Nature Knowledge', description: 'Plants, animals, seasons, weather', tracking_type: 'observation_log' },
      { id: 'science_topics', name: 'Science Topics', description: 'Structured science learning', tracking_type: 'topic_log', example_topics: ['solar_system', 'animals', 'plants', 'weather', 'human_body'] },
      { id: 'curiosity', name: 'Curiosity & Questions', description: 'Asks why/how questions, explores', tracking_type: 'observation_log' },
      { id: 'history_culture', name: 'History & Culture', description: 'Historical figures, geography, cultural learning', tracking_type: 'topic_log' },
      { id: 'memory_recall', name: 'Memory & Recall', description: 'Retains and connects learned information', tracking_type: 'observation_log' },
    ],
  },
];

export function getCategoryById(id: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getSkillById(categoryId: string, skillId: string) {
  return getCategoryById(categoryId)?.skills.find((s) => s.id === skillId);
}
