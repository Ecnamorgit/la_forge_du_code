import * as fs from 'fs';
import * as path from 'path';

const coursesDir = path.join(process.cwd(), 'codeforge/data/courses');
const courses = fs.readdirSync(coursesDir);
const result: any = {};

for (const course of courses) {
  const coursePath = path.join(coursesDir, course);
  if (!fs.statSync(coursePath).isDirectory()) continue;
  
  const files = fs.readdirSync(coursePath).filter(f => f.startsWith('chapitre-') && f.endsWith('.ts'));
  
  files.sort((a, b) => {
    const numA = parseInt(a.replace('chapitre-', '').replace('.ts', ''));
    const numB = parseInt(b.replace('chapitre-', '').replace('.ts', ''));
    return numA - numB;
  });

  const chapters = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(coursePath, file), 'utf-8');
    
    const slugMatch = content.match(/slug:\s*["']([^"']+)["']/);
    const slug = slugMatch ? slugMatch[1] : file.replace('.ts', '');
    
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : '';
    
    const totalSteps = (content.match(/briefing:\s*\{/g) || []).length;

    chapters.push({ slug, title: title.replace(/\\n/g, ' '), totalSteps });
  }
  result[course] = chapters;
}
console.log(JSON.stringify(result, null, 2));