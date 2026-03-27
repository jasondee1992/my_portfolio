$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$datasetPath = Join-Path $repoRoot "src\data\knowledge\chatbot-intent-dataset.json"
$questionScopePath = Join-Path $repoRoot "src\lib\chatbot\questionScope.ts"
$safeIntentsPath = Join-Path $repoRoot "src\lib\chatbot\safeIntents.ts"
$followUpResolverPath = Join-Path $repoRoot "src\lib\chatbot\followUpResolver.ts"
$personaMemoryPath = Join-Path $repoRoot "src\data\knowledge\persona-memory.json"
$profilePath = Join-Path $repoRoot "src\data\knowledge\profile.json"
$experiencePath = Join-Path $repoRoot "src\data\knowledge\experience.json"
$projectsPath = Join-Path $repoRoot "src\data\knowledge\projects.json"

if (-not (Test-Path $datasetPath)) {
  throw "Missing dataset file: $datasetPath"
}

$dataset = Get-Content $datasetPath -Raw | ConvertFrom-Json
$personaMemory = Get-Content $personaMemoryPath -Raw | ConvertFrom-Json
$profile = Get-Content $profilePath -Raw | ConvertFrom-Json
$experience = Get-Content $experiencePath -Raw | ConvertFrom-Json
$projects = Get-Content $projectsPath -Raw | ConvertFrom-Json

$requiredCategories = @(
  "open_conversation",
  "reaction_or_emotion",
  "acknowledgment",
  "accept_previous_offer",
  "reject_previous_offer",
  "self_intro",
  "current_role",
  "work_experience",
  "professional_background",
  "strongest_skills",
  "strengths_as_developer",
  "tech_stack",
  "projects_summary",
  "best_project",
  "proudest_project",
  "work_availability",
  "freelance_availability",
  "contact_info",
  "goals_in_five_years",
  "passions",
  "hobbies_or_free_time",
  "role_fit_skills",
  "why_apply",
  "motivation_for_role",
  "react_experience",
  "bedrock_experience",
  "ai_tools_experience",
  "local_llm_experience",
  "open_model_familiarity",
  "out_of_scope_question"
)

foreach ($category in $requiredCategories) {
  $entry = $dataset | Where-Object { $_.category -eq $category }

  if (-not $entry) {
    throw "Missing required intent category: $category"
  }

  if (-not $entry.scopeType) {
    throw "Missing scopeType for category: $category"
  }

  if (-not $entry.answerDirection) {
    throw "Missing answerDirection for category: $category"
  }

  if (-not $entry.answerSourcePriority -or $entry.answerSourcePriority.Count -eq 0) {
    throw "Missing answerSourcePriority for category: $category"
  }

  if (-not $entry.exampleQuestions -or $entry.exampleQuestions.Count -eq 0) {
    throw "Missing exampleQuestions for category: $category"
  }
}

$datasetChecks = @{
  open_conversation = @("what do you want to discuss", "what can we talk about", "ano ba gusto mong pag usapan", "anong pwede kong itanong")
  work_availability = @("are you open for a new role", "are you open to a new role", "are you open to new opportunities")
  react_experience = @("do you have experience in React frontend", "how many years of React experience do you have")
  bedrock_experience = @("do you have Amazon Bedrock experience", "how did you use Amazon Bedrock")
  ai_tools_experience = @("what AI tools have you used")
  local_llm_experience = @("have you tried local LLMs", "what local models have you used")
  accept_previous_offer = @("go on", "please continue", "tell more", "please tell more", "can you tell me more", "can you expand on that", "elaborate")
  tech_stack = @(
    "do you have aws experience",
    "what is your aws experience",
    "how many years of experience do you have in aws",
    "what is your cloud experience",
    "what aws services do you know",
    "have you deployed apps on aws",
    "what is your experience with aws amplify"
  )
}

foreach ($category in $datasetChecks.Keys) {
  $entry = $dataset | Where-Object { $_.category -eq $category }
  foreach ($phrase in $datasetChecks[$category]) {
    if ($entry.exampleQuestions -notcontains $phrase) {
      throw "Dataset category '$category' is missing expected example phrase: $phrase"
    }
  }
}

$questionScopeSource = Get-Content $questionScopePath -Raw
$safeIntentsSource = Get-Content $safeIntentsPath -Raw
$followUpResolverSource = Get-Content $followUpResolverPath -Raw

$questionScopeChecks = @(
  "how about work experience",
  "are you open for a new role",
  "are you open to full-time roles",
  "do you have amazon bedrock experience",
  "have you tried local llms",
  "what local models have you used",
  "do you have aws experience",
  "what is your aws experience",
  "how many years of experience do you have in aws",
  "what is your cloud experience",
  "have you deployed apps on aws",
  "what aws services do you know",
  "what is your experience with aws amplify",
  "what do you know about s3",
  "do you know route 53",
  "do you know acm",
  "do you know cloudwatch",
  "do you know iam",
  "do you know cloudfront",
  "what do you know about rds",
  "what do you know about aurora",
  "what do you know about dynamodb",
  "what do you know about rds aurora dynamodb and s3",
  "do you have ci cd deployment experience on aws",
  "are you an aws architect",
  "do you have deep cloud architecture experience"
)

foreach ($phrase in $questionScopeChecks) {
  if ($questionScopeSource.ToLowerInvariant() -notlike "*$($phrase.ToLowerInvariant())*") {
    throw "questionScope.ts is missing expected phrase: $phrase"
  }
}

$safeIntentChecks = @(
  "what do you want to discuss",
  "what can we talk about",
  "ano ba gusto mong pag usapan",
  "anong pwede kong itanong",
  "awesome",
  "yes please",
  "tell me more",
  "trimleadingconversationalprefix",
  "leading_conversational_prefixes",
  "analyzequestionscope(trimmedmixedintentremainder)",
  "understood",
  "got it",
  "noted",
  "alright"
)

foreach ($phrase in $safeIntentChecks) {
  if ($safeIntentsSource.ToLowerInvariant() -notlike "*$($phrase.ToLowerInvariant())*") {
    throw "safeIntents.ts is missing expected phrase: $phrase"
  }
}

$mixedIntentScenarioCoverage = @(
  @{
    Scenario = "Acknowledgment plus AWS question"
    Message = "nice awesome. how many years of experience do you have in aws?"
    RequiresSafeIntentBypass = @("nice", "awesome")
    RequiresScopeCoverage = "how many years of experience do you have in aws"
    ExpectedRoute = "answer aws question"
    Avoids = "acknowledgment-only reply"
  },
  @{
    Scenario = "Acknowledgment plus AWS services question"
    Message = "okay great, what aws services do you know?"
    RequiresSafeIntentBypass = @("okay", "great")
    RequiresScopeCoverage = "what aws services do you know"
    ExpectedRoute = "answer aws services question"
    Avoids = "acknowledgment-only reply"
  },
  @{
    Scenario = "Thanks plus project question"
    Message = "thanks. can you tell me about your portfolio project?"
    RequiresSafeIntentBypass = @("thanks")
    RequiresScopeCoverage = "tell me about your portfolio project"
    ExpectedRoute = "answer the project question"
    Avoids = "thanks-only reply"
  },
  @{
    Scenario = "Reaction plus recruiter question"
    Message = "cool. are you open to freelance work?"
    RequiresSafeIntentBypass = @("cool")
    RequiresScopeCoverage = "are you open to freelance work"
    ExpectedRoute = "answer the recruiter question"
    Avoids = "reaction-only reply"
  },
  @{
    Scenario = "Standalone acknowledgment"
    Message = "awesome"
    RequiresSafeIntentBypass = @()
    RequiresScopeCoverage = ""
    ExpectedRoute = "keep quick conversational reply"
    Avoids = "portfolio routing requirement"
  }
)

foreach ($scenario in $mixedIntentScenarioCoverage) {
  foreach ($prefix in $scenario.RequiresSafeIntentBypass) {
    if ($safeIntentsSource.ToLowerInvariant() -notlike "*$($prefix.ToLowerInvariant())*") {
      throw "Mixed-intent scenario '$($scenario.Scenario)' is missing expected conversational prefix coverage: $prefix"
    }
  }

  if ($scenario.RequiresScopeCoverage) {
    if ($questionScopeSource.ToLowerInvariant() -notlike "*$($scenario.RequiresScopeCoverage.ToLowerInvariant())*") {
      throw "Mixed-intent scenario '$($scenario.Scenario)' is missing expected scope phrase: $($scenario.RequiresScopeCoverage)"
    }
  }
}

$followUpChecks = @(
  "yes",
  "yes please",
  "sige please",
  "go ahead",
  "go on",
  "continue",
  "please continue",
  "tell more",
  "please tell more",
  "tell me more",
  "can you tell me more",
  "can you expand on that",
  "expand on that",
  "elaborate",
  "please do",
  "not now",
  "no thanks"
)

foreach ($phrase in $followUpChecks) {
  if ($followUpResolverSource.ToLowerInvariant() -notlike "*$($phrase.ToLowerInvariant())*") {
    throw "followUpResolver.ts is missing expected phrase: $phrase"
  }
}

$followUpContinuityChecks = @(
  "getlastansweredusermessage",
  "analyzequestionscope(previoususermessage)",
  "previousquestionscope.scope !== ""outside""",
  "please continue your previous answer to this topic",
  "isfallbackstyleanswer",
  "!previoususermessage",
  "leading_ack_or_gratitude_prefixes",
  "stripleadingackorgratitude",
  "isexplicitacceptancemessage(continuationcandidate)"
)

foreach ($phrase in $followUpContinuityChecks) {
  if ($followUpResolverSource.ToLowerInvariant() -notlike "*$($phrase.ToLowerInvariant())*") {
    throw "followUpResolver.ts is missing expected follow-up continuity logic marker: $phrase"
  }
}

$forbiddenAcceptPhrases = @(
  '"sige"',
  '"tell me"',
  '"go"',
  '"kwento mo"',
  '"more please"',
  '"sure go ahead"'
)

foreach ($phrase in $forbiddenAcceptPhrases) {
  if ($followUpResolverSource.ToLowerInvariant() -like "*$($phrase.ToLowerInvariant())*") {
    throw "followUpResolver.ts contains forbidden acceptance phrase: $phrase"
  }
}

$followUpScenarioCoverage = @(
  @{
    Scenario = "Explicit offer plus acknowledgment and continuation"
    PriorUserQuestion = ""
    FollowUp = "please tell more"
    ExpectedRoute = "continue explicit offered topic"
    Avoids = "acknowledgment-only reply"
  },
  @{
    Scenario = "Explicit offer plus thanks and continuation"
    PriorUserQuestion = ""
    FollowUp = "tell me more"
    ExpectedRoute = "continue explicit offered topic"
    Avoids = "thanks-only reply"
  },
  @{
    Scenario = "Explicit offer plus thank you and expand request"
    PriorUserQuestion = ""
    FollowUp = "can you expand on that"
    ExpectedRoute = "continue explicit offered topic"
    Avoids = "polite closing only"
  },
  @{
    Scenario = "AWS topic continuation"
    PriorUserQuestion = "do you have aws experience"
    FollowUp = "can you tell me more"
    ExpectedRoute = "continue same aws topic"
    Avoids = "out of scope fallback"
  },
  @{
    Scenario = "Skills topic continuation"
    PriorUserQuestion = "what is your tech stack"
    FollowUp = "elaborate"
    ExpectedRoute = "continue same skills topic"
    Avoids = "generic fallback"
  },
  @{
    Scenario = "Project topic continuation"
    PriorUserQuestion = "tell me about your portfolio project"
    FollowUp = "go on"
    ExpectedRoute = "continue same project topic"
    Avoids = "outside scope"
  },
  @{
    Scenario = "No valid prior topic"
    PriorUserQuestion = ""
    FollowUp = "can you tell me more"
    ExpectedRoute = "fall through normally"
    Avoids = "fake continuation"
  }
)

foreach ($scenario in $followUpScenarioCoverage) {
  if ($scenario.PriorUserQuestion) {
    $questionScopeSourceLower = $questionScopeSource.ToLowerInvariant()
    if ($questionScopeSourceLower -notlike "*$($scenario.PriorUserQuestion.ToLowerInvariant())*") {
      throw "Missing scope coverage for follow-up scenario '$($scenario.Scenario)': $($scenario.PriorUserQuestion)"
    }
  }

  if ($followUpResolverSource.ToLowerInvariant() -notlike "*$($scenario.FollowUp.ToLowerInvariant())*") {
    throw "Missing follow-up phrase coverage for scenario '$($scenario.Scenario)': $($scenario.FollowUp)"
    }
  }

$standaloneConversationalCoverage = @(
  @{
    Scenario = "Standalone acknowledgment"
    Message = "okay"
    ExpectedRoute = "quick conversational reply"
  },
  @{
    Scenario = "Standalone thanks"
    Message = "thank you"
    ExpectedRoute = "polite closing or acknowledgment reply"
  }
)

foreach ($scenario in $standaloneConversationalCoverage) {
  if ($safeIntentsSource.ToLowerInvariant() -notlike "*$($scenario.Message.ToLowerInvariant())*") {
    throw "Missing standalone conversational coverage for scenario '$($scenario.Scenario)': $($scenario.Message)"
  }
}

$awsFaqChecks = @(
  @{
    Question = "Do you have AWS experience?"
    ExpectedAnswerIncludes = @("aws", "devops", "personal projects", "directly")
    Avoids = @("aws architect", "deep cloud architecture")
  },
  @{
    Question = "What is your cloud experience?"
    ExpectedAnswerIncludes = @("aws-based application delivery", "devops", "hosting", "hands-on ownership")
    Avoids = @("expert cloud architect", "deep architecture ownership")
  },
  @{
    Question = "How many years of experience do you have in AWS?"
    ExpectedAnswerIncludes = @("do not present it as a fixed aws year count", "devops", "personal projects", "aws amplify")
    Avoids = @("5 years of aws", "3 years of aws", "2 years of aws")
  },
  @{
    Question = "Have you deployed apps on AWS?"
    ExpectedAnswerIncludes = @("deployed", "aws", "portfolio project", "aws amplify", "github-based ci/cd")
    Avoids = @("multi-region architecture", "advanced platform engineering")
  },
  @{
    Question = "What AWS services do you know?"
    ExpectedAnswerIncludes = @("aws amplify", "amazon s3", "route 53", "cloudfront")
    Avoids = @("certified solutions architect")
  },
  @{
    Question = "What is your experience with AWS Amplify?"
    ExpectedAnswerIncludes = @("hands-on", "aws amplify", "portfolio project", "github-based ci/cd")
    Avoids = @("deep amplify specialization")
  },
  @{
    Question = "What do you know about S3?"
    ExpectedAnswerIncludes = @("object", "file storage", "static assets", "rather than")
    Avoids = @("s3 is a relational database")
  },
  @{
    Question = "Do you know Route 53, ACM, CloudWatch, IAM, or CloudFront?"
    ExpectedAnswerIncludes = @("dns", "https", "monitoring", "permission", "content delivery")
    Avoids = @("advanced security architect")
  },
  @{
    Question = "What do you know about RDS, Aurora, DynamoDB, and S3?"
    ExpectedAnswerIncludes = @("relational", "nosql", "object storage")
    Avoids = @("primary relational database for s3")
  },
  @{
    Question = "Do you have CI/CD deployment experience on AWS?"
    ExpectedAnswerIncludes = @("ci/cd", "devops", "personal projects", "aws amplify", "github")
    Avoids = @("designed enterprise-wide platform strategy")
  },
  @{
    Question = "Are you an AWS architect?"
    ExpectedAnswerIncludes = @("not", "aws architect", "application deployment")
    Avoids = @("yes")
  },
  @{
    Question = "Do you have deep cloud architecture experience?"
    ExpectedAnswerIncludes = @("not", "deep cloud architecture", "practical deployment")
    Avoids = @("yes")
  }
)

foreach ($check in $awsFaqChecks) {
  $faqEntry = $personaMemory.faq | Where-Object { $_.question -eq $check.Question }

  if (-not $faqEntry) {
    throw "persona-memory.json is missing AWS/cloud FAQ entry: $($check.Question)"
  }

  $answerText = $faqEntry.answer.ToLowerInvariant()

  foreach ($phrase in $check.ExpectedAnswerIncludes) {
    if ($answerText -notlike "*$($phrase.ToLowerInvariant())*") {
      throw "AWS/cloud FAQ '$($check.Question)' is missing expected answer content: $phrase"
    }
  }

  foreach ($phrase in $check.Avoids) {
    if ($answerText -like "*$($phrase.ToLowerInvariant())*") {
      throw "AWS/cloud FAQ '$($check.Question)' contains forbidden overstatement or incorrect phrasing: $phrase"
    }
  }
}

$profileSummary = $profile.professional_summary.ToLowerInvariant()
if (
  $profileSummary -notlike "*aws*" -or
  $profileSummary -notlike "*devops*" -or
  $profileSummary -notlike "*personal*" -or
  $profileSummary -notlike "*portfolio*"
) {
  throw "profile.json professional_summary is missing expected top-level AWS/cloud summary coverage."
}

$cloudSkills = @($profile.core_skills.cloud_and_deployment)
$requiredCloudSkills = @(
  "AWS deployment support and release coordination in collaboration with DevOps teams",
  "CI/CD-based build and deployment workflow familiarity",
  "End-to-end AWS setup and deployment for personal web projects",
  "GitHub-connected CI/CD configuration for personal deployments"
)

foreach ($skill in $requiredCloudSkills) {
  if ($cloudSkills -notcontains $skill) {
    throw "profile.json cloud_and_deployment is missing expected item: $skill"
  }
}

$platformTools = @($profile.core_skills.tools_and_platforms)
$requiredAwsTools = @(
  "AWS Amplify",
  "Amazon S3",
  "Amazon Route 53",
  "AWS Certificate Manager (ACM)",
  "AWS CloudWatch",
  "IAM concepts",
  "CloudFront"
)

foreach ($tool in $requiredAwsTools) {
  if ($platformTools -notcontains $tool) {
    throw "profile.json tools_and_platforms is missing expected AWS service: $tool"
  }
}

$cloudDbKnowledge = @($profile.core_skills.cloud_database_knowledge) -join " "
foreach ($phrase in @("Amazon RDS", "Amazon Aurora", "Amazon DynamoDB", "Amazon S3")) {
  if ($cloudDbKnowledge -notlike "*$phrase*") {
    throw "profile.json cloud_database_knowledge is missing expected AWS storage/database phrase: $phrase"
  }
}

$jpmcEntry = $experience | Where-Object { $_.company -eq "JPMorgan Chase & Co." }
if (-not $jpmcEntry) {
  throw "experience.json is missing JPMorgan Chase & Co. entry."
}

$jpmcDetails = @($jpmcEntry.details) -join " "
foreach ($phrase in @("AWS-based deployment pipelines", "CI/CD-based deployment workflows", "DevOps teams", "rather than acting as the primary infrastructure owner")) {
  if ($jpmcDetails -notlike "*$phrase*") {
    throw "experience.json JPMorgan entry is missing expected AWS/cloud detail: $phrase"
  }
}

$portfolioProject = $projects.other_works | Where-Object { $_.title -eq "My Portfolio" }
if (-not $portfolioProject) {
  throw "projects.json is missing 'My Portfolio' entry."
}

foreach ($item in @("AWS Amplify", "GitHub CI/CD")) {
  if (@($portfolioProject.tech_stack) -notcontains $item) {
    throw "projects.json 'My Portfolio' tech_stack is missing expected AWS/project item: $item"
  }
}

$portfolioDescription = $portfolioProject.description.ToLowerInvariant()
foreach ($phrase in @("aws amplify", "github-based ci/cd", "handled the aws setup and deployment")) {
  if ($portfolioDescription -notlike "*$phrase*") {
    throw "projects.json 'My Portfolio' description is missing expected AWS deployment detail: $phrase"
  }
}

Write-Host "Chatbot intent regression checks passed."
