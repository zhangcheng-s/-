<template>
  <div class="detail-container">
    <!-- Hero Header Section -->
    <div class="hero-header">
      <div class="hero-content">
        <div class="hero-left">
          <h1 class="species-name">{{ detailData.scientificName || '未知物种' }}</h1>
          <p class="author-citation" v-if="detailData.taxonomicAuthorCitation">
            {{ detailData.taxonomicAuthorCitation }}
          </p>
          <div class="status-tags">
            <el-tag v-if="detailData.identificationStatus" type="success" effect="dark">
              {{ detailData.identificationStatus }}
            </el-tag>
            <el-tag v-if="detailData.taxonomicStatus" type="info" effect="dark">
              {{ detailData.taxonomicStatus }}
            </el-tag>
          </div>
        </div>
        <div class="hero-right" v-if="detailData.photoFileName">
          <img :src="detailData.photoFileName" :alt="detailData.scientificName" class="species-photo">
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card" v-if="hasValue(detailData.numberOfIndividuals)">
        <i class="el-icon-view stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">个体数量</div>
          <div class="stat-value">{{ detailData.numberOfIndividuals }}</div>
        </div>
      </div>
      <div class="stat-card" v-if="hasValue(detailData.totalBiomassCollected)">
        <i class="el-icon-s-data stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">总生物量</div>
          <div class="stat-value">{{ detailData.totalBiomassCollected }} {{ detailData.totalBiomassUnits }}</div>
        </div>
      </div>
      <div class="stat-card" v-if="hasValue(detailData.relativeAbundance)">
        <i class="el-icon-data-line stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">相对丰度</div>
          <div class="stat-value">{{ detailData.relativeAbundance }}%</div>
        </div>
      </div>
      <div class="stat-card" v-if="hasValue(detailData.taxonDensity)">
        <i class="el-icon-s-grid stat-icon"></i>
        <div class="stat-content">
          <div class="stat-label">分类群密度</div>
          <div class="stat-value">{{ detailData.taxonDensity }} {{ detailData.taxonDensityUnits }}</div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Basic Information Cards -->
      <el-card class="info-card" v-if="hasSampleInfo">
        <div slot="header" class="card-header">
          <i class="el-icon-document"></i>
          <span>样本信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="hasValue(detailData.sampleId)">
            <div class="info-label">样本ID</div>
            <div class="info-value">{{ detailData.sampleId }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.sampleName)">
            <div class="info-label">样本名称</div>
            <div class="info-value">{{ detailData.sampleName }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.orgnum)">
            <div class="info-label">组织编号</div>
            <div class="info-value">{{ detailData.orgnum }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="info-card" v-if="hasStationInfo">
        <div slot="header" class="card-header">
          <i class="el-icon-map-location"></i>
          <span>站点信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="hasValue(detailData.stationId)">
            <div class="info-label">站点ID</div>
            <div class="info-value">{{ detailData.stationId }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.transectId)">
            <div class="info-label">样带ID</div>
            <div class="info-value">{{ detailData.transectId }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="info-card" v-if="hasValue(detailData.cruiseId)">
        <div slot="header" class="card-header">
          <i class="el-icon-ship"></i>
          <span>航次信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">航次ID</div>
            <div class="info-value">{{ detailData.cruiseId }}</div>
          </div>
        </div>
      </el-card>

      <!-- Ecological Data Analysis Card -->
      <el-card class="info-card full-width" v-if="hasEcologicalMetrics">
        <div slot="header" class="card-header">
          <i class="el-icon-s-marketing"></i>
          <span>生态数据分析</span>
        </div>
        <div class="progress-container">
          <div class="progress-item" v-if="hasValue(detailData.relativeAbundance)">
            <div class="progress-label">相对丰度</div>
            <el-progress :percentage="safePercentage(detailData.relativeAbundance)" :color="'#67C23A'"></el-progress>
          </div>
          <div class="progress-item" v-if="hasValue(detailData.relativeDominance)">
            <div class="progress-label">相对优势度</div>
            <el-progress :percentage="safePercentage(detailData.relativeDominance)" :color="'#409EFF'"></el-progress>
          </div>
          <div class="progress-item" v-if="hasValue(detailData.taxonDensity)">
            <div class="progress-label">分类群密度</div>
            <el-progress :percentage="safePercentage(detailData.taxonDensity)" :color="'#E6A23C'"></el-progress>
          </div>
        </div>
      </el-card>

      <!-- Detailed Ecology Information Card -->
      <el-card class="info-card full-width" v-if="hasDetailedEcology">
        <div slot="header" class="card-header">
          <i class="el-icon-s-data"></i>
          <span>详细生态学信息</span>
        </div>
        <div class="ecology-grid">
          <div class="ecology-item" v-if="hasValue(detailData.totalBiomassCollected)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <i class="el-icon-s-data"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">总生物量</div>
              <div class="ecology-value">{{ detailData.totalBiomassCollected }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.totalBiomassUnits)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <i class="el-icon-coin"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">生物量单位</div>
              <div class="ecology-value">{{ detailData.totalBiomassUnits }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.nominalSizeCategory)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <i class="el-icon-picture-outline"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">个体大小</div>
              <div class="ecology-value">{{ detailData.nominalSizeCategory }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.numberOfIndividuals)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
              <i class="el-icon-view"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">个体数量</div>
              <div class="ecology-value">{{ detailData.numberOfIndividuals }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.relativeAbundance)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <i class="el-icon-data-line"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">相对丰度</div>
              <div class="ecology-value">{{ detailData.relativeAbundance }}%</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.relativeDominance)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%)">
              <i class="el-icon-s-marketing"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">相对优势度</div>
              <div class="ecology-value">{{ detailData.relativeDominance }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.taxonDensity)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)">
              <i class="el-icon-s-grid"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">分类群密度</div>
              <div class="ecology-value">{{ detailData.taxonDensity }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.taxonDensityUnits)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)">
              <i class="el-icon-menu"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">密度单位</div>
              <div class="ecology-value">{{ detailData.taxonDensityUnits }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.lifeStage)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
              <i class="el-icon-time"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">生命周期</div>
              <div class="ecology-value">{{ detailData.lifeStage }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.sex)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)">
              <i class="el-icon-user"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">性别</div>
              <div class="ecology-value">{{ detailData.sex }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.reproductiveState)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)">
              <i class="el-icon-data-analysis"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">繁殖状态</div>
              <div class="ecology-value">{{ detailData.reproductiveState }}</div>
            </div>
          </div>
          <div class="ecology-item" v-if="hasValue(detailData.associatedTaxa)">
            <div class="ecology-icon-wrapper" style="background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)">
              <i class="el-icon-link"></i>
            </div>
            <div class="ecology-content">
              <div class="ecology-label">相关类群</div>
              <div class="ecology-value">{{ detailData.associatedTaxa }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Taxonomy Card -->
      <el-card class="info-card full-width" v-if="hasTaxonomy">
        <div slot="header" class="card-header">
          <i class="el-icon-folder"></i>
          <span>分类学信息</span>
        </div>
        <div class="taxonomy-hierarchy">
          <div class="taxonomy-item" v-if="hasValue(detailData.taxaKingdom)">
            <span class="taxonomy-label">界:</span>
            <span class="taxonomy-value">{{ detailData.taxaKingdom }}</span>
          </div>
          <div class="taxonomy-arrow" v-if="hasValue(detailData.taxaKingdom) && hasValue(detailData.taxaPhylum)">→</div>
          <div class="taxonomy-item" v-if="hasValue(detailData.taxaPhylum)">
            <span class="taxonomy-label">门:</span>
            <span class="taxonomy-value">{{ detailData.taxaPhylum }}</span>
          </div>
          <div class="taxonomy-arrow" v-if="hasValue(detailData.taxaPhylum) && hasValue(detailData.taxaClass)">→</div>
          <div class="taxonomy-item" v-if="hasValue(detailData.taxaClass)">
            <span class="taxonomy-label">纲:</span>
            <span class="taxonomy-value">{{ detailData.taxaClass }}</span>
          </div>
          <div class="taxonomy-arrow" v-if="hasValue(detailData.taxaClass) && hasValue(detailData.taxaOrder)">→</div>
          <div class="taxonomy-item" v-if="hasValue(detailData.taxaOrder)">
            <span class="taxonomy-label">目:</span>
            <span class="taxonomy-value">{{ detailData.taxaOrder }}</span>
          </div>
          <div class="taxonomy-arrow" v-if="hasValue(detailData.taxaOrder) && hasValue(detailData.taxaFamily)">→</div>
          <div class="taxonomy-item" v-if="hasValue(detailData.taxaFamily)">
            <span class="taxonomy-label">科:</span>
            <span class="taxonomy-value">{{ detailData.taxaFamily }}</span>
          </div>
          <div class="taxonomy-arrow" v-if="hasValue(detailData.taxaFamily) && hasValue(detailData.taxaSubfamily)">→</div>
          <div class="taxonomy-item" v-if="hasValue(detailData.taxaSubfamily)">
            <span class="taxonomy-label">亚科:</span>
            <span class="taxonomy-value">{{ detailData.taxaSubfamily }}</span>
          </div>
          <div class="taxonomy-arrow" v-if="hasValue(detailData.taxaSubfamily) && hasValue(detailData.taxaGenus)">→</div>
          <div class="taxonomy-item" v-if="hasValue(detailData.taxaGenus)">
            <span class="taxonomy-label">属:</span>
            <span class="taxonomy-value">{{ detailData.taxaGenus }}</span>
          </div>
          <div class="taxonomy-arrow" v-if="hasValue(detailData.taxaGenus) && hasValue(detailData.taxaSpecies)">→</div>
          <div class="taxonomy-item" v-if="hasValue(detailData.taxaSpecies)">
            <span class="taxonomy-label">种:</span>
            <span class="taxonomy-value">{{ detailData.taxaSpecies }}</span>
          </div>
        </div>
        <div class="taxonomy-extra" v-if="hasValue(detailData.morphotype) || hasValue(detailData.taxonomicIdentificationQualifier)">
          <div class="info-item" v-if="hasValue(detailData.morphotype)">
            <div class="info-label">形态型</div>
            <div class="info-value">{{ detailData.morphotype }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.taxonomicIdentificationQualifier)">
            <div class="info-label">鉴定限定词</div>
            <div class="info-value">{{ detailData.taxonomicIdentificationQualifier }}</div>
          </div>
        </div>
      </el-card>

      <!-- Ecology Notes Card -->
      <el-card class="info-card full-width" v-if="hasEcologyNotes">
        <div slot="header" class="card-header">
          <i class="el-icon-document"></i>
          <span>生态学备注</span>
        </div>
        <div class="notes-content">
          <div class="note-item" v-if="hasValue(detailData.additionalNotesAboutEcology)">
            <div class="note-label">生态学备注</div>
            <div class="note-text">{{ detailData.additionalNotesAboutEcology }}</div>
          </div>
          <div class="note-item" v-if="hasValue(detailData.additionalNotesAboutOrganism)">
            <div class="note-label">生物体备注</div>
            <div class="note-text">{{ detailData.additionalNotesAboutOrganism }}</div>
          </div>
          <div class="note-item" v-if="hasValue(detailData.notesOnTaxonomicIdentification)">
            <div class="note-label">分类鉴定备注</div>
            <div class="note-text">{{ detailData.notesOnTaxonomicIdentification }}</div>
          </div>
        </div>
      </el-card>

      <!-- DNA Identification Card -->
      <el-card class="info-card full-width" v-if="hasDnaInfo">
        <div slot="header" class="card-header">
          <i class="el-icon-discover"></i>
          <span>DNA鉴定信息</span>
        </div>
        <div class="dna-grid">
          <div class="info-item" v-if="hasValue(detailData.dnaPhylum)">
            <div class="info-label">DNA门</div>
            <div class="info-value">{{ detailData.dnaPhylum }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.dnaClass)">
            <div class="info-label">DNA纲</div>
            <div class="info-value">{{ detailData.dnaClass }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.dnaOrder)">
            <div class="info-label">DNA目</div>
            <div class="info-value">{{ detailData.dnaOrder }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.dnaFamily)">
            <div class="info-label">DNA科</div>
            <div class="info-value">{{ detailData.dnaFamily }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.dnaSubfamily)">
            <div class="info-label">DNA亚科</div>
            <div class="info-value">{{ detailData.dnaSubfamily }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.dnaGenus)">
            <div class="info-label">DNA属</div>
            <div class="info-value">{{ detailData.dnaGenus }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.dnaSpecies)">
            <div class="info-label">DNA种</div>
            <div class="info-value">{{ detailData.dnaSpecies }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.dnaGenesUsed)">
            <div class="info-label">使用的基因</div>
            <div class="info-value">{{ detailData.dnaGenesUsed }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.notesOnDnaOrMorphologicalIdentification)">
            <div class="info-label">DNA/形态鉴定备注</div>
            <div class="info-value">{{ detailData.notesOnDnaOrMorphologicalIdentification }}</div>
          </div>
        </div>
        <div class="dna-taxonomist" v-if="hasValue(detailData.dnaTaxonomist) || hasValue(detailData.dnaTaxonomistEmail) || hasValue(detailData.dnaTaxonomistInstitution)">
          <h4>DNA分类学家</h4>
          <div class="info-grid">
            <div class="info-item" v-if="hasValue(detailData.dnaTaxonomist)">
              <div class="info-label">姓名</div>
              <div class="info-value">{{ detailData.dnaTaxonomist }}</div>
            </div>
            <div class="info-item" v-if="hasValue(detailData.dnaTaxonomistEmail)">
              <div class="info-label">邮箱</div>
              <div class="info-value">{{ detailData.dnaTaxonomistEmail }}</div>
            </div>
            <div class="info-item" v-if="hasValue(detailData.dnaTaxonomistInstitution)">
              <div class="info-label">机构</div>
              <div class="info-value">{{ detailData.dnaTaxonomistInstitution }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Identifier Information Card -->
      <el-card class="info-card" v-if="hasIdentifierInfo">
        <div slot="header" class="card-header">
          <i class="el-icon-user"></i>
          <span>鉴定人信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="hasValue(detailData.nameOfIdentifier)">
            <div class="info-label">鉴定人姓名</div>
            <div class="info-value">{{ detailData.nameOfIdentifier }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.identifierEmail)">
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ detailData.identifierEmail }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.identifierInstitution)">
            <div class="info-label">机构</div>
            <div class="info-value">{{ detailData.identifierInstitution }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.isTaxonomist)">
            <div class="info-label">是否为分类学家</div>
            <div class="info-value">{{ detailData.isTaxonomist ? '是' : '否' }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.identificationMethod)">
            <div class="info-label">鉴定方法</div>
            <div class="info-value">{{ detailData.identificationMethod }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.identificationDate)">
            <div class="info-label">鉴定日期</div>
            <div class="info-value">{{ detailData.identificationDate }}</div>
          </div>
        </div>
      </el-card>

      <!-- Voucher Information Card -->
      <el-card class="info-card" v-if="hasVoucherInfo">
        <div slot="header" class="card-header">
          <i class="el-icon-key"></i>
          <span>凭证信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="hasValue(detailData.voucherStatus)">
            <div class="info-label">凭证状态</div>
            <div class="info-value">{{ detailData.voucherStatus }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.voucherCode)">
            <div class="info-label">凭证编码</div>
            <div class="info-value">{{ detailData.voucherCode }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.voucherInstitutionCode)">
            <div class="info-label">机构代码</div>
            <div class="info-value">{{ detailData.voucherInstitutionCode }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.tissueDescriptor)">
            <div class="info-label">组织描述符</div>
            <div class="info-value">{{ detailData.tissueDescriptor }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.preservationMethod)">
            <div class="info-label">保存方法</div>
            <div class="info-value">{{ detailData.preservationMethod }}</div>
          </div>
        </div>
      </el-card>

      <!-- Molecular Data Card -->
      <el-card class="info-card" v-if="hasMolecularData">
        <div slot="header" class="card-header">
          <i class="el-icon-discover"></i>
          <span>分子数据</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="hasValue(detailData.genebankSequenceNumber)">
            <div class="info-label">GenBank序列号</div>
            <div class="info-value">{{ detailData.genebankSequenceNumber }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.insdAccessionNumber)">
            <div class="info-label">INSDC登录号</div>
            <div class="info-value">{{ detailData.insdAccessionNumber }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.descriptionOfMolecularMarker)">
            <div class="info-label">分子标记描述</div>
            <div class="info-value">{{ detailData.descriptionOfMolecularMarker }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.lifeScienceIdentifier)">
            <div class="info-label">生命科学标识符</div>
            <div class="info-value">{{ detailData.lifeScienceIdentifier }}</div>
          </div>
        </div>
      </el-card>

      <!-- Database Information Card -->
      <el-card class="info-card" v-if="hasDatabaseInfo">
        <div slot="header" class="card-header">
          <i class="el-icon-s-data"></i>
          <span>数据库信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="hasValue(detailData.taxonomicDatabase)">
            <div class="info-label">分类学数据库</div>
            <div class="info-value">{{ detailData.taxonomicDatabase }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.databaseTaxaId)">
            <div class="info-label">数据库类群ID</div>
            <div class="info-value">{{ detailData.databaseTaxaId }}</div>
          </div>
        </div>
      </el-card>

      <!-- Media Information Card -->
      <el-card class="info-card" v-if="hasMediaInfo">
        <div slot="header" class="card-header">
          <i class="el-icon-picture"></i>
          <span>媒体信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="hasValue(detailData.photoFileName)">
            <div class="info-label">照片文件名</div>
            <div class="info-value">{{ detailData.photoFileName }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.videoFrameCode)">
            <div class="info-label">视频帧代码</div>
            <div class="info-value">{{ detailData.videoFrameCode }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.videoPhotoFrameFileName)">
            <div class="info-label">视频照片帧文件名</div>
            <div class="info-value">{{ detailData.videoPhotoFrameFileName }}</div>
          </div>
        </div>
      </el-card>

      <!-- Timestamps Card -->
      <el-card class="info-card" v-if="hasTimestamps">
        <div slot="header" class="card-header">
          <i class="el-icon-time"></i>
          <span>时间戳</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="hasValue(detailData.createdTime)">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ detailData.createdTime }}</div>
          </div>
          <div class="info-item" v-if="hasValue(detailData.updatedTime)">
            <div class="info-label">更新时间</div>
            <div class="info-value">{{ detailData.updatedTime }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailView',
  data() {
    return {
      detailData: {
        // Initialize with empty data structure
        id: 0,
        sampleId: 0,
        sampleName: "",
        stationId: 0,
        cruiseId: 0,
        orgnum: 0,
        taxaKingdom: "",
        taxaPhylum: "",
        taxaClass: "",
        taxaOrder: "",
        taxaFamily: "",
        taxaSubfamily: "",
        taxaGenus: "",
        taxaSpecies: "",
        taxonomicAuthorCitation: "",
        scientificName: "",
        morphotype: "",
        taxonomicIdentificationQualifier: "",
        notesOnTaxonomicIdentification: "",
        identificationMethod: "",
        identificationDate: "",
        identificationStatus: "",
        totalBiomassCollected: 0,
        totalBiomassUnits: "",
        nominalSizeCategory: 0,
        numberOfIndividuals: 0,
        relativeAbundance: 0,
        relativeDominance: 0,
        taxonDensity: 0,
        taxonDensityUnits: "",
        additionalNotesAboutEcology: "",
        lifeStage: "",
        sex: "",
        reproductiveState: "",
        associatedTaxa: "",
        additionalNotesAboutOrganism: "",
        transectId: "",
        photoFileName: "",
        videoFrameCode: "",
        videoPhotoFrameFileName: "",
        createdTime: "",
        updatedTime: "",
        taxonomicDatabase: "",
        databaseTaxaId: "",
        lifeScienceIdentifier: "",
        taxonomicStatus: "",
        insdAccessionNumber: "",
        descriptionOfMolecularMarker: "",
        voucherStatus: "",
        voucherCode: "",
        voucherInstitutionCode: "",
        tissueDescriptor: "",
        preservationMethod: "",
        nameOfIdentifier: "",
        identifierEmail: "",
        identifierInstitution: "",
        isTaxonomist: null,
        dnaPhylum: "",
        dnaClass: "",
        dnaOrder: "",
        dnaFamily: "",
        dnaSubfamily: "",
        dnaGenus: "",
        dnaSpecies: "",
        genebankSequenceNumber: "",
        dnaTaxonomist: "",
        dnaTaxonomistEmail: "",
        dnaTaxonomistInstitution: "",
        dnaGenesUsed: "",
        notesOnDnaOrMorphologicalIdentification: ""
      }
    };
  },
  computed: {
    hasSampleInfo() {
      return this.hasValue(this.detailData.sampleId) || 
             this.hasValue(this.detailData.sampleName) || 
             this.hasValue(this.detailData.orgnum);
    },
    hasStationInfo() {
      return this.hasValue(this.detailData.stationId) || 
             this.hasValue(this.detailData.transectId);
    },
    hasEcologicalMetrics() {
      return this.hasValue(this.detailData.relativeAbundance) || 
             this.hasValue(this.detailData.relativeDominance) || 
             this.hasValue(this.detailData.taxonDensity);
    },
    hasDetailedEcology() {
      return this.hasValue(this.detailData.totalBiomassCollected) || 
             this.hasValue(this.detailData.totalBiomassUnits) ||
             this.hasValue(this.detailData.nominalSizeCategory) ||
             this.hasValue(this.detailData.numberOfIndividuals) ||
             this.hasValue(this.detailData.relativeAbundance) ||
             this.hasValue(this.detailData.relativeDominance) ||
             this.hasValue(this.detailData.taxonDensity) ||
             this.hasValue(this.detailData.taxonDensityUnits) ||
             this.hasValue(this.detailData.lifeStage) ||
             this.hasValue(this.detailData.sex) ||
             this.hasValue(this.detailData.reproductiveState) ||
             this.hasValue(this.detailData.associatedTaxa);
    },
    hasTaxonomy() {
      return this.hasValue(this.detailData.taxaKingdom) || 
             this.hasValue(this.detailData.taxaPhylum) ||
             this.hasValue(this.detailData.taxaClass) ||
             this.hasValue(this.detailData.taxaOrder) ||
             this.hasValue(this.detailData.taxaFamily) ||
             this.hasValue(this.detailData.taxaSubfamily) ||
             this.hasValue(this.detailData.taxaGenus) ||
             this.hasValue(this.detailData.taxaSpecies) ||
             this.hasValue(this.detailData.morphotype) ||
             this.hasValue(this.detailData.taxonomicIdentificationQualifier);
    },
    hasEcologyNotes() {
      return this.hasValue(this.detailData.additionalNotesAboutEcology) || 
             this.hasValue(this.detailData.additionalNotesAboutOrganism) ||
             this.hasValue(this.detailData.notesOnTaxonomicIdentification);
    },
    hasDnaInfo() {
      return this.hasValue(this.detailData.dnaPhylum) || 
             this.hasValue(this.detailData.dnaClass) ||
             this.hasValue(this.detailData.dnaOrder) ||
             this.hasValue(this.detailData.dnaFamily) ||
             this.hasValue(this.detailData.dnaSubfamily) ||
             this.hasValue(this.detailData.dnaGenus) ||
             this.hasValue(this.detailData.dnaSpecies) ||
             this.hasValue(this.detailData.dnaGenesUsed) ||
             this.hasValue(this.detailData.dnaTaxonomist) ||
             this.hasValue(this.detailData.dnaTaxonomistEmail) ||
             this.hasValue(this.detailData.dnaTaxonomistInstitution) ||
             this.hasValue(this.detailData.notesOnDnaOrMorphologicalIdentification);
    },
    hasIdentifierInfo() {
      return this.hasValue(this.detailData.nameOfIdentifier) || 
             this.hasValue(this.detailData.identifierEmail) ||
             this.hasValue(this.detailData.identifierInstitution) ||
             this.hasValue(this.detailData.isTaxonomist) ||
             this.hasValue(this.detailData.identificationMethod) ||
             this.hasValue(this.detailData.identificationDate);
    },
    hasVoucherInfo() {
      return this.hasValue(this.detailData.voucherStatus) || 
             this.hasValue(this.detailData.voucherCode) ||
             this.hasValue(this.detailData.voucherInstitutionCode) ||
             this.hasValue(this.detailData.tissueDescriptor) ||
             this.hasValue(this.detailData.preservationMethod);
    },
    hasMolecularData() {
      return this.hasValue(this.detailData.genebankSequenceNumber) || 
             this.hasValue(this.detailData.insdAccessionNumber) ||
             this.hasValue(this.detailData.descriptionOfMolecularMarker) ||
             this.hasValue(this.detailData.lifeScienceIdentifier);
    },
    hasDatabaseInfo() {
      return this.hasValue(this.detailData.taxonomicDatabase) || 
             this.hasValue(this.detailData.databaseTaxaId);
    },
    hasMediaInfo() {
      return this.hasValue(this.detailData.photoFileName) || 
             this.hasValue(this.detailData.videoFrameCode) ||
             this.hasValue(this.detailData.videoPhotoFrameFileName);
    },
    hasTimestamps() {
      return this.hasValue(this.detailData.createdTime) || 
             this.hasValue(this.detailData.updatedTime);
    }
  },
  methods: {
    hasValue(value) {
      // Check if value exists and is not empty
      if (value === null || value === undefined) {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      // Note: Numeric 0 is treated as "no value" for this use case
      // If 0 is a valid value for certain fields, consider field-specific validation
      if (typeof value === 'number' && value === 0) {
        return false;
      }
      if (typeof value === 'boolean') {
        return true; // boolean values are always considered valid
      }
      return true;
    },
    // Safely parse percentage value and cap at 100
    safePercentage(value) {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        return 0;
      }
      return Math.min(100, Math.max(0, parsed));
    },
    // Method to load data from API
    loadDetailData(id) {
      // This method should be called with the ID to fetch data
      // Example: this.loadDetailData(this.$route.params.id)
      // fetch(`/api/details/${id}`)
      //   .then(response => response.json())
      //   .then(data => {
      //     this.detailData = data;
      //   });
    }
  },
  mounted() {
    // Load data when component is mounted
    // You can get the ID from route params or props
    // this.loadDetailData(this.$route.params.id);
  }
};
</script>

<style scoped>
.detail-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Hero Header */
.hero-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.hero-left {
  flex: 1;
}

.species-name {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.author-citation {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 20px 0;
}

.status-tags {
  display: flex;
  gap: 12px;
}

.hero-right {
  width: 200px;
  height: 200px;
}

.species-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 40px;
  color: #667eea;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.info-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header i {
  font-size: 20px;
  color: #667eea;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  word-break: break-word;
}

/* Progress Container */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* Ecology Grid */
.ecology-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.ecology-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.ecology-item:hover {
  background: #ecf0f5;
  transform: translateX(4px);
}

.ecology-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.ecology-content {
  flex: 1;
  min-width: 0;
}

.ecology-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.ecology-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
  word-break: break-word;
}

/* Taxonomy Hierarchy */
.taxonomy-hierarchy {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
}

.taxonomy-item {
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.taxonomy-label {
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
}

.taxonomy-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.taxonomy-arrow {
  font-size: 18px;
  color: #667eea;
  font-weight: bold;
}

.taxonomy-extra {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

/* Notes Content */
.notes-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.note-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.note-label {
  font-size: 12px;
  color: #909399;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.note-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* DNA Grid */
.dna-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.dna-taxonomist {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.dna-taxonomist h4 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-right {
    width: 150px;
    height: 150px;
  }

  .species-name {
    font-size: 24px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .ecology-grid {
    grid-template-columns: 1fr;
  }

  .taxonomy-hierarchy {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
