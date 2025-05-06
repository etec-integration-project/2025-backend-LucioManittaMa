import json
import os
import yaml

with open('.github/doc-config.yml') as f:
    config = yaml.safe_load(f)

output_dir = config.get('output_dir', 'docs/')
os.makedirs(output_dir, exist_ok=True)

def load_json(filename):
    with open(filename) as f:
        return json.load(f)

milestones = load_json('milestones.json')
issues = load_json('issues.json')
prs = load_json('prs.json')

def milestone_summary(ms):
    total = ms['open_issues'] + ms['closed_issues']
    percent = int((ms['closed_issues'] / total) * 100) if total else 0
    return f"### {ms['title']}\n{ms.get('description','')}\n- Estado: {ms['state']}\n- Vencimiento: {ms.get('due_on','N/A')}\n- Progreso: {percent}% ({ms['closed_issues']}/{total} issues cerrados)\n"

def group_issues_by_label(issues, include_labels, exclude_labels):
    groups = {}
    for issue in issues:
        if 'pull_request' in issue:
            continue  # skip PRs
        labels = [l['name'] for l in issue['labels']]
        if any(l in exclude_labels for l in labels):
            continue
        for label in labels:
            if label in include_labels:
                groups.setdefault(label, []).append(issue)
    return groups

def changelog(issues):
    closed = [i for i in issues if i['state'] == 'closed' and 'pull_request' not in i]
    return "\n".join([f"- {i['title']} (#{i['number']})" for i in closed])

def release_notes(prs):
    merged = [pr for pr in prs if pr.get('merged_at')]
    return "\n".join([f"- {pr['title']} (#{pr['number']})" for pr in merged])

md = "# 📄 Documentación de Progreso\n\n## Milestones\n"
for ms in milestones:
    md += milestone_summary(ms) + "\n"

md += "\n## Issues por etiqueta\n"
groups = group_issues_by_label(issues, config['include_labels'], config['exclude_labels'])
for label, group in groups.items():
    md += f"\n### {label}\n"
    for issue in group:
        md += f"- {issue['title']} (#{issue['number']}) [{issue['state']}]\n"

md += "\n## Changelog (Issues cerrados)\n"
md += changelog(issues)

md += "\n\n## Notas de Lanzamiento (PRs fusionados)\n"
md += release_notes(prs)

with open(os.path.join(output_dir, 'index.md'), 'w') as f:
    f.write(md)
