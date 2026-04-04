/**
 * Format retrieved portfolio rows into labeled chunks for the LLM (no raw dump).
 */

/**
 * @param {Array<{ title: string, description: string, links?: string }>} projects — from retrieval, ordered by relevance
 * @param {object} options
 * @param {Record<string, object>} options.projectDetails
 * @param {(title: string) => string | undefined} options.resolveProjectDetailsKey
 * @param {boolean} options.userAsksForLink
 * @param {number} [options.maxChunks=5]
 * @returns {string}
 */
export function formatRagContextChunks(projects, options) {
  const {
    projectDetails,
    resolveProjectDetailsKey,
    userAsksForLink,
    maxChunks = 5,
  } = options;

  const seenTitles = new Set();
  const blocks = [];

  for (const project of projects) {
    if (blocks.length >= maxChunks) break;

    const normTitle = String(project.title || '').trim().toLowerCase();
    if (!normTitle || seenTitles.has(normTitle)) continue;
    seenTitles.add(normTitle);

    const matchingKey = resolveProjectDetailsKey(project.title);
    const details = matchingKey ? projectDetails[matchingKey] || {} : {};

    const technologies =
      Array.isArray(details.technologies) && details.technologies.length > 0
        ? details.technologies.join(', ')
        : 'Not specified in portfolio notes';

    const features =
      Array.isArray(details.features) && details.features.length > 0
        ? details.features.join(', ')
        : 'Not specified in portfolio notes';

    const detailParts = [];
    if (details.type) detailParts.push(`Type: ${details.type}`);
    if (details.category) detailParts.push(`Category: ${details.category}`);
    if (details.isIndividual === true) {
      detailParts.push('Team: Individual project (Syed Bakhtawar Abbas)');
    } else if (details.isIndividual === false && details.teamSize != null) {
      let teamLine = `Team: ${details.teamSize} members`;
      if (details.teamLead) teamLine += `; team lead: ${details.teamLead}`;
      detailParts.push(teamLine);
    }
    if (details.developedIn) detailParts.push(`Developed: ${details.developedIn}`);
    if (details.projectNature) detailParts.push(`Project nature: ${details.projectNature}`);
    if (details.howItWorks) detailParts.push(`How it works: ${details.howItWorks}`);
    if (details.additionalInfo) detailParts.push(details.additionalInfo);
    if (project.links && userAsksForLink) {
      detailParts.push(`Repository: ${project.links}`);
    }

    const extraDetails =
      detailParts.length > 0 ? detailParts.join(' ') : 'No extra structured notes.';

    blocks.push(
      `Project: ${project.title}
Description: ${project.description}
Technologies: ${technologies}
Features: ${features}
Details: ${extraDetails}`
    );
  }

  return blocks.join('\n\n---\n\n');
}
