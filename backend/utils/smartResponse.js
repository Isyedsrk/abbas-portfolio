/**
 * Smart response generator that creates natural, conversational responses
 * Works without AI API - generates dynamic, varied responses
 */

import { projectDetails } from '../data/projectDetails.js';
import {
  resolveProjectDetailsKey,
  isVagueProjectQuery,
} from './projectKeywordMatch.js';

/**
 * Generate a natural, conversational response about a project
 */
export async function generateSmartResponse(question, project, allProjects = []) {
  const questionLower = question.toLowerCase().trim();
  const key = resolveProjectDetailsKey(project.title);
  const details = (key && projectDetails[key]) || {};

  const intent = analyzeQuestionIntent(questionLower);

  if (isVagueProjectQuery(question) && (intent === 'general' || intent === 'what')) {
    return generateBriefOverview(project, details);
  }

  switch (intent) {
    case 'tech':
      return generateTechResponse(project, details);
    case 'features':
      return generateFeaturesResponse(project, details);
    case 'how':
      return generateHowResponse(project, details);
    case 'what':
      return generateWhatResponse(project, details);
    case 'why':
      return generateWhyResponse(project, details);
    case 'more':
      return generateDetailedResponse(project, details);
    case 'team':
      return generateTeamResponse(project, details);
    default:
      return generateGeneralResponse(project, details, question);
  }
}

/**
 * Analyze question intent
 */
function analyzeQuestionIntent(question) {
  if (
    /\b(who made|made by|who built|who created|team(\s+size)?|how many people|developers?)\b/.test(
      question
    )
  ) {
    return 'team';
  }
  if (
    /\b(tech|technology|technologies|stack|framework|language|librar(y|ies)|tool|programming|code|built with|develop(ed)? with|what\s+.{0,24}\b(use|using)\b|what tech)\b/.test(
      question
    )
  ) {
    return 'tech';
  }
  if (/\b(feature|features|capability|capabilities|can|does|do|what can|what does)\b/.test(question)) {
    return 'features';
  }
  if (/^how\s+/.test(question) || /\bhow\s+(does|did|do|is|was|work|works|function)\b/.test(question)) {
    return 'how';
  }
  if (/^what\s+(is|are|was|were)/.test(question) || /\btell\s+me\s+about\b/.test(question)) {
    return 'what';
  }
  if (/^why\s+/.test(question) || /\bwhy\s+(did|do|is|was)\b/.test(question)) {
    return 'why';
  }
  if (/^(more|tell me more|more details?|more info|elaborate|explain more)/.test(question)) {
    return 'more';
  }
  return 'general';
}

function generateBriefOverview(project, details) {
  let text = `${project.title}: ${project.description}`;
  if (details.type) {
    text += ` It's a ${details.type.toLowerCase()}`;
    if (details.category) text += ` (${details.category})`;
    text += '.';
  } else {
    text += '.';
  }
  if (details.isIndividual === true) {
    text += ' Syed developed this as an individual project.';
  } else if (details.teamSize) {
    text += ` It was a team project with ${details.teamSize} members.`;
  }
  text +=
    ' Ask if you want the tech stack, features, how it works, or more about the team.';
  return text;
}

function generateTeamResponse(project, details) {
  if (details.isIndividual) {
    return `${project.title} was an individual project by Syed—${project.description.toLowerCase()}`;
  }
  let r = `${project.title} was built by a team of ${details.teamSize ?? 'several'} members`;
  if (details.teamLead) {
    r += ` (team lead: ${details.teamLead})`;
  }
  r += '. ';
  r += details.additionalInfo || project.description;
  return r;
}

/**
 * Generate tech-focused response
 */
function generateTechResponse(project, details) {
  const techs = details.technologies || [];
  if (techs.length === 0) return generateGeneralResponse(project, details);
  
  const openings = [
    `I built ${project.title} using `,
    `For ${project.title}, I used `,
    `The tech stack for ${project.title} includes `,
    `${project.title} was developed with `,
    `When creating ${project.title}, I leveraged `,
    `I implemented ${project.title} with `,
  ];
  
  const connectors = [
    () => techs.length <= 3 ? techs.join(', ') : `${techs.slice(0, 2).join(', ')}, and ${techs.length - 2} other technologies including ${techs.slice(2, 4).join(' and ')}`,
    () => techs.length <= 2 ? techs.join(' and ') : `${techs.slice(0, 2).join(', ')}, along with ${techs.slice(2).join(', ')}`,
    () => techs.length <= 4 ? techs.join(', ') : `${techs.slice(0, 3).join(', ')}, plus ${techs.length - 3} more like ${techs[3]}`,
  ];
  
  let response = openings[Math.floor(Math.random() * openings.length)];
  response += connectors[Math.floor(Math.random() * connectors.length)]() + '.';
  
  const descriptions = [
    ` ${project.description}`,
    `\n\n${project.description}`,
    `\n\nIn essence, ${project.description.toLowerCase()}`,
  ];
  response += descriptions[Math.floor(Math.random() * descriptions.length)];
  
  if (details.additionalInfo) {
    const infoFormats = [
      ` ${details.additionalInfo}`,
      `\n\n${details.additionalInfo}`,
      `\n\nNotably, ${details.additionalInfo.toLowerCase()}`,
    ];
    response += infoFormats[Math.floor(Math.random() * infoFormats.length)];
  }
  
  if (project.links) {
    const linkFormats = [
      `\n\nYou can check out the code: ${project.links}`,
      `\n\n🔗 GitHub: ${project.links}`,
      `\n\nSee the implementation: ${project.links}`,
    ];
    response += linkFormats[Math.floor(Math.random() * linkFormats.length)];
  }
  
  return response;
}

/**
 * Generate features-focused response
 */
function generateFeaturesResponse(project, details) {
  const features = details.features || [];
  
  let response = `${project.title} offers several key capabilities:\n\n`;
  
  if (features.length > 0) {
    features.forEach((feature, idx) => {
      response += `${idx + 1}. ${feature}\n`;
    });
  } else {
    response += `• ${project.description}\n`;
  }
  
  response += `\n${project.description}`;
  
  if (details.additionalInfo) {
    response += `\n\n${details.additionalInfo}`;
  }
  
  if (project.links) {
    response += `\n\nSee it in action: ${project.links}`;
  }
  
  return response;
}

/**
 * Generate how-it-works response
 */
function generateHowResponse(project, details) {
  const openings = [
    `Here's how ${project.title} works: `,
    `${project.title} functions by `,
    `So ${project.title} works like this: `,
  ];
  
  let response = openings[Math.floor(Math.random() * openings.length)] + project.description.toLowerCase();
  
  if (details.additionalInfo) {
    response += ` ${details.additionalInfo}`;
  }
  
  const techs = details.technologies || [];
  if (techs.length > 0) {
    response += ` I implemented it using ${techs.slice(0, 3).join(', ')}`;
    if (techs.length > 3) response += ` and ${techs.length - 3} more technologies`;
    response += '.';
  }
  
  if (project.links) {
    response += `\n\nFor technical details, check: ${project.links}`;
  }
  
  return response;
}

/**
 * Generate what-is response
 */
function generateWhatResponse(project, details) {
  const responses = [
    () => {
      const starts = [
        `${project.title} is ${project.description.toLowerCase()}`,
        `**${project.title}** is ${project.description.toLowerCase()}`,
        `So ${project.title} is essentially ${project.description.toLowerCase()}`,
      ];
      let r = starts[Math.floor(Math.random() * starts.length)];
      if (details.type) {
        const typeFormats = [
          ` It's a ${details.type.toLowerCase()}`,
          ` - a ${details.type.toLowerCase()}`,
          `, which is a ${details.type.toLowerCase()}`,
        ];
        r += typeFormats[Math.floor(Math.random() * typeFormats.length)];
      }
      if (details.category) {
        const catFormats = [
          ` in the ${details.category} space`,
          ` focused on ${details.category}`,
          ` within the ${details.category} domain`,
        ];
        r += catFormats[Math.floor(Math.random() * catFormats.length)];
      }
      r += '.';
      return r;
    },
    () => {
      let r = project.description;
      if (details.type || details.category) {
        r += ` It's a ${details.type || 'project'}`;
        if (details.category) r += ` in ${details.category}`;
        r += '.';
      }
      const techs = details.technologies || [];
      if (techs.length > 0) {
        const techFormats = [
          `\n\nI built it using ${techs.slice(0, 2).join(' and ')}`,
          `\n\nTech stack includes ${techs.slice(0, 3).join(', ')}`,
          `\n\nBuilt with ${techs.slice(0, 2).join(', ')}`,
        ];
        r += techFormats[Math.floor(Math.random() * techFormats.length)];
        if (techs.length > 3) r += ` and ${techs.length - 3} more`;
        r += '.';
      }
      return r;
    },
    () => {
      let r = `**${project.title}** - ${project.description}`;
      if (details.additionalInfo) {
        r += ` ${details.additionalInfo}`;
      }
      const techs = details.technologies || [];
      if (techs.length > 0) {
        r += `\n\nTechnologies: ${techs.slice(0, 4).join(', ')}`;
        if (techs.length > 4) r += `, and more`;
        r += '.';
      }
      return r;
    },
    () => {
      let r = project.description;
      if (details.additionalInfo) {
        r += ` ${details.additionalInfo}`;
      }
      return r;
    }
  ];
  
  const selected = responses[Math.floor(Math.random() * responses.length)];
  let response = selected();
  
  if (project.links) {
    const linkFormats = [
      `\n\n🔗 ${project.links}`,
      `\n\nCheck it out: ${project.links}`,
      `\n\nGitHub: ${project.links}`,
    ];
    response += linkFormats[Math.floor(Math.random() * linkFormats.length)];
  }
  
  return response;
}

/**
 * Generate why response
 */
function generateWhyResponse(project, details) {
  let response = `I created ${project.title} because `;
  
  const reasons = [
    `it addresses a real need: ${project.description.toLowerCase()}`,
    `it showcases my skills in ${details.category || 'software development'}`,
    `it demonstrates practical application of ${details.technologies?.[0] || 'modern technologies'}`,
  ];
  
  response += reasons[Math.floor(Math.random() * reasons.length)] + '.';
  
  if (details.additionalInfo) {
    response += ` ${details.additionalInfo}`;
  }
  
  if (project.links) {
    response += `\n\nCheck it out: ${project.links}`;
  }
  
  return response;
}

/**
 * Generate detailed response (for "more details" questions)
 */
function generateDetailedResponse(project, details) {
  let response = `Here's a comprehensive overview of **${project.title}**:\n\n`;
  
  response += `**Overview:**\n${project.description}\n\n`;
  
  if (details.type || details.category) {
    response += `**Type:** ${details.type || 'Project'}`;
    if (details.category) response += ` (${details.category})`;
    response += `\n\n`;
  }
  
  const techs = details.technologies || [];
  if (techs.length > 0) {
    response += `**Technologies:**\n`;
    techs.forEach((tech, idx) => {
      response += `${idx + 1}. ${tech}\n`;
    });
    response += `\n`;
  }
  
  const features = details.features || [];
  if (features.length > 0) {
    response += `**Key Features:**\n`;
    features.forEach(feature => {
      response += `• ${feature}\n`;
    });
    response += `\n`;
  }
  
  if (details.additionalInfo) {
    response += `**Technical Details:**\n${details.additionalInfo}\n\n`;
  }
  
  if (project.links) {
    response += `🔗 **GitHub:** ${project.links}`;
  }
  
  return response;
}

/**
 * Generate general response
 */
function generateGeneralResponse(project, details, question = '') {
  const responses = [
    () => {
      const starts = [
        project.description,
        `**${project.title}** is ${project.description.toLowerCase()}`,
        `So ${project.title} - ${project.description.toLowerCase()}`,
      ];
      let r = starts[Math.floor(Math.random() * starts.length)];
      if (details.type) {
        const typeFormats = [
          ` It's a ${details.type.toLowerCase()}`,
          ` - a ${details.type.toLowerCase()}`,
        ];
        r += typeFormats[Math.floor(Math.random() * typeFormats.length)];
      }
      if (details.category) {
        r += ` in the ${details.category} domain`;
      }
      r += '.';
      const techs = details.technologies || [];
      if (techs.length > 0) {
        const techFormats = [
          ` Built with ${techs.slice(0, 2).join(' and ')}`,
          ` I used ${techs.slice(0, 2).join(' and ')}`,
          ` Developed using ${techs.slice(0, 2).join(' and ')}`,
        ];
        r += techFormats[Math.floor(Math.random() * techFormats.length)];
        if (techs.length > 2) r += `, plus ${techs.length - 2} more`;
        r += '.';
      }
      return r;
    },
    () => {
      let r = project.description;
      if (details.additionalInfo) {
        const infoFormats = [
          ` ${details.additionalInfo}`,
          `\n\n${details.additionalInfo}`,
          `. ${details.additionalInfo}`,
        ];
        r += infoFormats[Math.floor(Math.random() * infoFormats.length)];
      }
      const techs = details.technologies || [];
      if (techs.length > 0) {
        r += `\n\nTechnologies: ${techs.slice(0, 4).join(', ')}`;
        if (techs.length > 4) r += ` and more`;
        r += '.';
      }
      return r;
    },
    () => {
      let r = `**${project.title}** - ${project.description}`;
      if (details.additionalInfo) {
        r += `\n\n${details.additionalInfo}`;
      }
      const techs = details.technologies || [];
      if (techs.length > 0) {
        r += `\n\nBuilt with: ${techs.slice(0, 3).join(', ')}`;
        if (techs.length > 3) r += `, and ${techs.length - 3} more`;
        r += '.';
      }
      return r;
    },
    () => {
      let r = project.description;
      if (details.additionalInfo) {
        r += ` ${details.additionalInfo}`;
      }
      return r;
    }
  ];
  
  const selected = responses[Math.floor(Math.random() * responses.length)];
  let response = selected();
  
  if (project.links) {
    const linkFormats = [
      `\n\n🔗 ${project.links}`,
      `\n\nCheck it out: ${project.links}`,
      `\n\nGitHub: ${project.links}`,
      `\n\nSee the code: ${project.links}`,
    ];
    response += linkFormats[Math.floor(Math.random() * linkFormats.length)];
  }
  
  return response;
}

