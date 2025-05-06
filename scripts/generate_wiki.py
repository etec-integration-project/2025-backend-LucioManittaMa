import json
import os
import yaml

with open('.github/doc-config.yml') as f:
    config = yaml.safe_load(f)

def load_json(filename):
    with open(filename) as f:
        return json.load(f)

milestones = load_json('milestones.json')
issues = load_json('issues.json')
prs = load_json('prs.json')

os.makedirs('wiki', exist_ok=True)

# Milestones
with open('wiki/Milestones.md', 'w') as f:
    for ms in milestones:
        total = ms['open_issues'] + ms['closed_issues']
        percent = int((ms['closed_issues'] / total) * 100) if total else 0
        f.write(f"## {ms['title']}\n{ms.get('description','')}\n- Estado: {ms['state']}\n- Vencimiento: {ms.get('due_on','N/A')}\n- Progreso: {percent}% ({ms['closed_issues']}/{total} issues cerrados)\n\n")

# Issues agrupados
groups = {}
for issue in issues:
    if 'pull_request' in issue:
        continue
    labels = [l['name'] for l in issue['labels']]
    for label in labels:
        if label in config['include_labels']:
            groups.setdefault(label, []).append(issue)

for label, group in groups.items():
    with open(f'wiki/Issues_{label}.md', 'w') as f:
        for issue in group:
            f.write(f"- {issue['title']} (#{issue['number']}) [{issue['state']}]\n")

# PRs fusionados
with open('wiki/PRs_Merged.md', 'w') as f:
    merged = [pr for pr in prs if pr.get('merged_at')]
    for pr in merged:
        f.write(f"- {pr['title']} (#{pr['number']})\n")
